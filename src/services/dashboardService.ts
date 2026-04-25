// src/services/dashboardService.ts
// ============================================================
// DASHBOARD SERVICE — aggregate all data in one call
// ============================================================

import { supabase } from '../lib/supabase';
import { getAlerts } from './alertService';
import { getRecommendations, getTradeOffOptions } from './recommendationService';
import { costOfDelay, attachRiskExplanation } from './riskService';
import type { DashboardData, DashboardMetrics, ServiceResult, Shipment } from '../types';

// ─── getDashboardData ────────────────────────────────────────

export async function getDashboardData(
  userId: string
): Promise<ServiceResult<DashboardData>> {
  // Parallel fetch
  const [shipmentsRes, alertsRes, recsRes] = await Promise.all([
    supabase.from('shipments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    getAlerts(userId),
    getRecommendations(userId),
  ]);

  if (shipmentsRes.error) return { data: null, error: shipmentsRes.error.message };
  if (alertsRes.error)    return { data: null, error: alertsRes.error };
  if (recsRes.error)      return { data: null, error: recsRes.error };

  const rawShipments     = shipmentsRes.data ?? [];
  const alerts          = alertsRes.data    ?? [];
  const recommendations = recsRes.data      ?? [];

  // Enrich At-Risk shipments with AI explanation
  const shipments = await Promise.all(
    rawShipments.map(async (s: Shipment) => {
      if (s.status === 'at_risk' || s.risk_score > 60) {
        return await attachRiskExplanation(s);
      }
      return s;
    })
  );

  // Trade-off options for all at-risk shipments
  const atRiskShipments = shipments.filter((s: Shipment) => s.status === 'at_risk');
  const tradeOffResults = await Promise.all(
    atRiskShipments.map((s: Shipment) => getTradeOffOptions(s.id))
  );
  const trade_off_options = tradeOffResults.flatMap((r) => r.data ?? []);

  // Metrics
  const metrics: DashboardMetrics = computeMetrics(shipments);

  return {
    data: { shipments, alerts, recommendations, trade_off_options, metrics },
    error: null,
  };
}

// ─── computeMetrics ──────────────────────────────────────────

function computeMetrics(shipments: Shipment[]): DashboardMetrics {
  const at_risk = shipments.filter((s) => s.status === 'at_risk');
  const delayed = shipments.filter((s) => s.status === 'delayed');

  const total_value_at_risk = at_risk.reduce((sum, s) => sum + s.value, 0);

  const total_cost_of_delay = [...at_risk, ...delayed].reduce(
    (sum, s) => sum + costOfDelay(s),
    0
  );

  return {
    total_shipments:     shipments.length,
    at_risk_count:       at_risk.length,
    delayed_count:       delayed.length,
    on_time_count:       shipments.filter((s) => s.status === 'on_time').length,
    total_value_at_risk: parseFloat(total_value_at_risk.toFixed(2)),
    total_cost_of_delay: parseFloat(total_cost_of_delay.toFixed(2)),
  };
}
