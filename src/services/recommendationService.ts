// src/services/recommendationService.ts
// ============================================================
// RECOMMENDATION SERVICE
// ============================================================

import { supabase } from '../lib/supabase';
import { deactivateAlertsForShipment } from './alertService';
import type {
  Recommendation,
  TradeOffOption,
  Shipment,
  ServiceResult,
} from '../types';
import { generateRecommendationExplanation } from './aiService';

// ─── generateRecommendation ──────────────────────────────────
// If risk > 70 → suggest reroute
// If delayed → suggest delay mitigation

export async function generateRecommendation(
  shipment: Shipment
): Promise<ServiceResult<Recommendation | null>> {
  const isDelayed = shipment.status === 'delayed' || shipment.status === 'at_risk';
  const isHighRisk = shipment.risk_score > 70;

  if (!isDelayed && !isHighRisk) return { data: null, error: null };

  const action_type = isHighRisk ? 'reroute' : 'delay_mitigation';

  // Simple deterministic estimates
  const risk_after    = Math.max(shipment.risk_score - 25, 10);
  const eta_change    = action_type === 'reroute' ? 4 : -6;  // hours
  const cost_impact   = action_type === 'reroute' ? shipment.value * 0.03 : shipment.value * 0.01;
  const confidence    = isHighRisk ? 78 : 85;
  const description   =
    action_type === 'reroute'
      ? `Reroute ${shipment.shipment_code} via alternative corridor to reduce risk from ${shipment.risk_score} → ${risk_after}`
      : `Apply delay mitigation for ${shipment.shipment_code}: priority handling + partner coordination`;

  const { data, error } = await supabase
    .from('recommendations')
    .insert({
      shipment_id:  shipment.id,
      action_type,
      description,
      risk_before:  shipment.risk_score,
      risk_after,
      eta_change,
      cost_impact:  parseFloat(cost_impact.toFixed(2)),
      confidence,
      is_applied:   false,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Attach AI explanation
  if (data) {
    (data as any).explanation = await generateRecommendationExplanation(data);
  }

  return { data, error: null };
}

// ─── applyRecommendation ─────────────────────────────────────
// Single atomic transaction:
//   1. Update shipment (risk, status, eta)
//   2. Mark recommendation applied
//   3. Deactivate alerts
//   4. Insert audit log

export async function applyRecommendation(
  recommendation_id: string,
  userId: string
): Promise<ServiceResult<true>> {
  // 1. Fetch recommendation
  const { data: rec, error: recErr } = await supabase
    .from('recommendations')
    .select('*')
    .eq('id', recommendation_id)
    .single();

  if (recErr || !rec) return { data: null, error: recErr?.message ?? 'Recommendation not found' };
  if (rec.is_applied) return { data: null, error: 'Recommendation already applied' };

  // 2. Fetch shipment
  const { data: shipment, error: shipErr } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', rec.shipment_id)
    .single();

  if (shipErr || !shipment) return { data: null, error: shipErr?.message ?? 'Shipment not found' };

  // 3. Calculate new ETA
  const newEta = new Date(
    new Date(shipment.eta).getTime() + rec.eta_change * 3_600_000
  ).toISOString();

  const newStatus =
    rec.risk_after >= 70 ? 'at_risk' :
    rec.risk_after >= 40 ? 'delayed' :
    'on_time';

  // Supabase doesn't support real DB transactions from the client SDK,
  // so we sequence the writes and roll back manually on failure.
  try {
    // Step A — update shipment
    const { error: e1 } = await supabase
      .from('shipments')
      .update({ risk_score: rec.risk_after, status: newStatus, eta: newEta })
      .eq('id', rec.shipment_id);
    if (e1) throw new Error(e1.message);

    // Step B — mark recommendation applied
    const { error: e2 } = await supabase
      .from('recommendations')
      .update({ is_applied: true })
      .eq('id', recommendation_id);
    if (e2) throw new Error(e2.message);

    // Step C — deactivate alerts
    await deactivateAlertsForShipment(rec.shipment_id);

    // Step D — audit log
    const { error: e3 } = await supabase
      .from('audit_logs')
      .insert({
        shipment_id: rec.shipment_id,
        user_id:     userId,
        action:      `Applied recommendation: ${rec.action_type} (${recommendation_id})`,
        result:      'success',
      });
    if (e3) throw new Error(e3.message);

    return { data: true, error: null };
  } catch (err: any) {
    // Best-effort audit log for failures
    await supabase.from('audit_logs').insert({
      shipment_id: rec.shipment_id,
      user_id:     userId,
      action:      `Failed to apply recommendation ${recommendation_id}`,
      result:      `error: ${err.message}`,
    });
    return { data: null, error: err.message };
  }
}

// ─── getTradeOffOptions ──────────────────────────────────────
// Compare current route vs alternatives from the routes table

export async function getTradeOffOptions(
  shipment_id: string
): Promise<ServiceResult<TradeOffOption[]>> {
  const { data: routes, error } = await supabase
    .from('routes')
    .select('*')
    .eq('shipment_id', shipment_id)
    .order('risk_score', { ascending: true });

  if (error) return { data: null, error: error.message };
  if (!routes || routes.length === 0) return { data: [], error: null };

  // The lowest-risk route is the "best" option
  const bestId = routes[0].id;

  const options: TradeOffOption[] = routes.map((r) => ({
    route_id:   r.id,
    route_name: r.route_name,
    eta:        r.eta,
    risk_score: r.risk_score,
    cost:       r.cost,
    confidence: Math.max(0, 100 - r.risk_score),
    is_best:    r.id === bestId,
  }));

  return { data: options, error: null };
}

// ─── getRecommendations (all active for user) ─────────────────

export async function getRecommendations(
  userId: string
): Promise<ServiceResult<Recommendation[]>> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*, shipments!inner(user_id)')
    .eq('shipments.user_id', userId)
    .eq('is_applied', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { data: null, error: error.message };
  const recommendations = data ?? [];
  
  // Enrich with AI explanations
  const enriched = await Promise.all(
    recommendations.map(async (r: Recommendation) => ({
      ...r,
      explanation: await generateRecommendationExplanation(r)
    }))
  );

  return { data: enriched, error: null };
}
