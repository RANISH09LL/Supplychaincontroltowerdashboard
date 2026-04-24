// src/services/shipmentService.ts
// ============================================================
// SHIPMENT SERVICE — CRUD
// ============================================================

import { supabase } from '../lib/supabase';
import { calculateRisk, persistRiskScore } from './riskService';
import { generateAlert } from './alertService';
import { generateRecommendation } from './recommendationService';
import type { Shipment, CreateShipmentInput, ServiceResult } from '../types';

// ─── createShipment ──────────────────────────────────────────

export async function createShipment(
  userId: string,
  input: CreateShipmentInput
): Promise<ServiceResult<Shipment>> {
  const { data, error } = await supabase
    .from('shipments')
    .insert({
      user_id:        userId,
      shipment_code:  input.shipment_code,
      origin:         input.origin,
      destination:    input.destination,
      eta:            input.eta,
      value:          input.value,
      dependency_id:  input.dependency_id ?? null,
      status:         'on_time',
      risk_score:     0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── getShipments ────────────────────────────────────────────

export async function getShipments(userId: string): Promise<ServiceResult<Shipment[]>> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

// ─── getShipmentById ─────────────────────────────────────────

export async function getShipmentById(
  shipment_id: string
): Promise<ServiceResult<Shipment>> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', shipment_id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── refreshShipmentRisk ─────────────────────────────────────
// Pull fresh events + routes, recalculate, persist, alert

export async function refreshShipmentRisk(
  shipment: Shipment
): Promise<void> {
  const [eventsRes, routesRes] = await Promise.all([
    supabase.from('events').select('*').eq('shipment_id', shipment.id),
    supabase.from('routes').select('*').eq('shipment_id', shipment.id),
  ]);

  const events = eventsRes.data ?? [];
  const routes = routesRes.data ?? [];

  const risk = calculateRisk(shipment, events, routes);
  await persistRiskScore(shipment.id, risk);

  // Re-fetch updated shipment for alert/rec generation
  const updated = { ...shipment, risk_score: risk };
  await generateAlert(updated, events);
  await generateRecommendation(updated);
}

// ─── deleteShipment ──────────────────────────────────────────

export async function deleteShipment(
  shipment_id: string
): Promise<ServiceResult<true>> {
  const { error } = await supabase
    .from('shipments')
    .delete()
    .eq('id', shipment_id);

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
