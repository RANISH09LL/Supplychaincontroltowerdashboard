// src/services/alertService.ts
// ============================================================
// ALERT SERVICE — generate, fetch, deactivate
// ============================================================

import { supabase } from '../lib/supabase';
import type { Alert, Shipment, ShipmentEvent, Severity, ServiceResult } from '../types';

// ─── generateAlert ───────────────────────────────────────────
// Creates an alert when risk > 70 OR any high-severity event

export async function generateAlert(
  shipment: Shipment,
  events: ShipmentEvent[]
): Promise<ServiceResult<Alert | null>> {
  const hasHighSeverityEvent = events.some((e) => e.severity === 'high');

  if (shipment.risk_score <= 70 && !hasHighSeverityEvent) {
    return { data: null, error: null }; // no alert needed
  }

  const severity: Severity =
    shipment.risk_score >= 85 || hasHighSeverityEvent ? 'high' :
    shipment.risk_score >= 70 ? 'medium' :
    'low';

  const message = hasHighSeverityEvent
    ? `High-severity event detected on shipment ${shipment.shipment_code} (${shipment.origin} → ${shipment.destination})`
    : `Risk score critical: ${shipment.risk_score}/100 for shipment ${shipment.shipment_code}`;

  const { data, error } = await supabase
    .from('alerts')
    .insert({ shipment_id: shipment.id, message, severity, is_active: true })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── getAlerts ───────────────────────────────────────────────
// Returns all active alerts for a user's shipments

export async function getAlerts(userId: string): Promise<ServiceResult<Alert[]>> {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      shipment:shipments(shipment_code, origin, destination)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

// ─── deactivateAlertsForShipment ─────────────────────────────

export async function deactivateAlertsForShipment(
  shipment_id: string
): Promise<ServiceResult<true>> {
  const { error } = await supabase
    .from('alerts')
    .update({ is_active: false })
    .eq('shipment_id', shipment_id)
    .eq('is_active', true);

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
