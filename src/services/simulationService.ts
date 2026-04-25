// src/services/simulationService.ts
// ============================================================
// SIMULATION SERVICE — trigger, check plan access
// ============================================================

import { supabase } from '../lib/supabase';
import { checkPlanAccess } from './authService';
import { refreshShipmentRisk } from './shipmentService';
import { calculateCascadingRisk } from './riskService';
import type { SimulationType, ServiceResult, Simulation } from '../types';
import { generateSimulationInsight } from './aiService';

// Event descriptions per simulation type
const SIM_EVENTS: Record<SimulationType, { type: string; severity: string; description: string }> = {
  storm:        { type: 'weather',    severity: 'high',   description: 'Severe storm disrupting transit corridors' },
  congestion:   { type: 'congestion', severity: 'medium', description: 'Port congestion causing significant delays' },
  delay:        { type: 'delay',      severity: 'medium', description: 'Systemic delay across supply chain nodes' },
  demand_spike: { type: 'customs',    severity: 'low',    description: 'Demand spike causing customs queue backlog' },
};

// Plan access required per simulation type
const REQUIRED_FEATURE: Record<SimulationType, 'simulation' | 'stress_test'> = {
  storm:        'stress_test',
  congestion:   'simulation',
  delay:        'simulation',
  demand_spike: 'simulation',
};

// ─── triggerSimulation ───────────────────────────────────────

export async function triggerSimulation(
  type: SimulationType,
  userId: string,
  impact_factor: number = 1.0
): Promise<ServiceResult<{ simulation_id: string; affected_shipments: number }>> {

  // 1. Gate on plan
  const feature = REQUIRED_FEATURE[type];
  const hasAccess = await checkPlanAccess(userId, feature);
  if (!hasAccess) {
    return { data: null, error: `Your plan does not include the "${feature}" feature. Upgrade to unlock.` };
  }

  // 2. Create simulation record
  const { data: sim, error: simErr } = await supabase
    .from('simulations')
    .insert({ user_id: userId, type, impact_factor })
    .select()
    .single();
  if (simErr) return { data: null, error: simErr.message };

  // 3. Get all user's shipments
  const { data: shipments, error: shipErr } = await supabase
    .from('shipments')
    .select('*')
    .eq('user_id', userId);
  if (shipErr) return { data: null, error: shipErr.message };
  if (!shipments || shipments.length === 0) {
    return { data: { simulation_id: sim.id, affected_shipments: 0 }, error: null };
  }

  // 4. Insert a simulation event on every shipment + refresh risk
  const eventTemplate = SIM_EVENTS[type];
  const eventInserts = shipments.map((s) => ({
    shipment_id: s.id,
    type:        eventTemplate.type,
    severity:    eventTemplate.severity,
    description: eventTemplate.description,
  }));

  await supabase.from('events').insert(eventInserts);

  // 5. Refresh risk for all affected shipments + cascade
  await Promise.all(
    shipments.map(async (s) => {
      await refreshShipmentRisk(s);
      await calculateCascadingRisk(s.id);
    })
  );

  // 6. Increment total_simulations_run on profile
  await supabase.rpc('increment_simulations', { user_id_input: userId }).maybeSingle();
  // Fallback if RPC not set up:
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_simulations_run')
    .eq('id', userId)
    .single();
  if (profile) {
    await supabase
      .from('profiles')
      .update({ total_simulations_run: (profile.total_simulations_run ?? 0) + 1 })
      .eq('id', userId);
  }

  // Generate AI Insight
  const insightSummary = await generateSimulationInsight(sim as Simulation);

  return {
    data: { simulation_id: sim.id, affected_shipments: shipments.length, insightSummary },
    error: null,
  };
}
