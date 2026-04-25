// src/services/riskService.ts
// ============================================================
// RISK SERVICE — calculateRisk + calculateCascadingRisk
// ============================================================

import { supabase } from '../lib/supabase';
import type { Shipment, ShipmentEvent, Route, ServiceResult } from '../types';
import { generateRiskExplanation } from './aiService';

// ─── attachRiskExplanation ───────────────────────────────────
export async function attachRiskExplanation(shipment: Shipment): Promise<Shipment> {
  const explanation = await generateRiskExplanation(shipment);
  return { ...shipment, riskExplanation: explanation };
}

// ─── Severity weight map ─────────────────────────────────────

const SEVERITY_WEIGHT: Record<string, number> = {
  low:    10,
  medium: 25,
  high:   50,
};

const EVENT_TYPE_WEIGHT: Record<string, number> = {
  weather:    1.2,
  delay:      1.0,
  congestion: 0.9,
  customs:    0.8,
};

// ─── calculateRisk ───────────────────────────────────────────
// Combines event severity, route risk, and delay factor
// Returns 0–100 score

export function calculateRisk(
  shipment: Shipment,
  events: ShipmentEvent[],
  routes: Route[]
): number {
  let score = 0;

  // 1. Event contribution
  for (const event of events) {
    const base     = SEVERITY_WEIGHT[event.severity] ?? 10;
    const typeMulti = EVENT_TYPE_WEIGHT[event.type]   ?? 1.0;
    score += base * typeMulti;
  }

  // 2. Route risk (average of alternative routes if any, else 0)
  if (routes.length > 0) {
    const avgRouteRisk = routes.reduce((sum, r) => sum + r.risk_score, 0) / routes.length;
    score += avgRouteRisk * 0.3; // 30% weight from route landscape
  }

  // 3. Delay factor — hours past ETA
  const now        = Date.now();
  const etaMs      = new Date(shipment.eta).getTime();
  const hoursLate  = Math.max(0, (now - etaMs) / 3_600_000);
  score += Math.min(hoursLate * 2, 20); // cap delay contribution at 20 pts

  return Math.min(Math.round(score), 100);
}

// ─── calculateCascadingRisk ──────────────────────────────────
// Finds all shipments that depend on shipment_id and
// bumps their risk_score by +10 (capped at 100)

export async function calculateCascadingRisk(
  shipment_id: string
): Promise<ServiceResult<{ updated: number }>> {
  // 1. Find all dependents
  const { data: dependents, error: fetchErr } = await supabase
    .from('shipments')
    .select('id, risk_score')
    .eq('dependency_id', shipment_id);

  if (fetchErr) return { data: null, error: fetchErr.message };
  if (!dependents || dependents.length === 0) return { data: { updated: 0 }, error: null };

  // 2. Update each dependent's risk_score
  const updates = dependents.map((dep) => ({
    id: dep.id,
    risk_score: Math.min(dep.risk_score + 10, 100),
  }));

  const { error: updateErr } = await supabase
    .from('shipments')
    .upsert(updates, { onConflict: 'id' });

  if (updateErr) return { data: null, error: updateErr.message };
  return { data: { updated: dependents.length }, error: null };
}

// ─── Persist recalculated risk to DB ─────────────────────────

export async function persistRiskScore(
  shipment_id: string,
  risk_score: number
): Promise<ServiceResult<true>> {
  const status =
    risk_score >= 70 ? 'at_risk' :
    risk_score >= 40 ? 'delayed' :
    'on_time';

  const { error } = await supabase
    .from('shipments')
    .update({ risk_score, status })
    .eq('id', shipment_id);

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

// ─── Cost of delay helper ────────────────────────────────────
// cost_of_delay = value * 0.05 * hours_delayed

export function costOfDelay(shipment: Shipment): number {
  const now       = Date.now();
  const etaMs     = new Date(shipment.eta).getTime();
  const hoursLate = Math.max(0, (now - etaMs) / 3_600_000);
  return parseFloat((shipment.value * 0.05 * hoursLate).toFixed(2));
}
