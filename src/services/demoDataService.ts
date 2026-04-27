// src/services/demoDataService.ts
// ============================================================
// DEMO DATA SEEDING SERVICE
// ============================================================

import { supabase } from '../lib/supabase';
import { updatePlan } from './authService';
import type { ShipmentStatus, EventType, Severity, ActionType } from '../types';

export async function seedDemoDataIfNeeded(userId: string) {
  try {
    // 1. Reset existing data for a clean demo slate
    // This will cascade and delete events, routes, alerts, and recommendations
    await supabase.from('shipments').delete().eq('user_id', userId);

    // 2. Upgrade to Pro plan for demo
    await updatePlan(userId, 'pro');

    // 3. Generate Shipments
    const now = new Date();
    const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();

    const shipmentsData = [
      {
        user_id: userId,
        shipment_code: 'SHP-ELEC-8821',
        origin: 'Shenzhen, CN',
        destination: 'Los Angeles, US',
        eta: in5Days,
        status: 'on_time' as ShipmentStatus,
        risk_score: 15,
        value: 1250000,
      },
      {
        user_id: userId,
        shipment_code: 'SHP-PHARM-4490',
        origin: 'Basel, CH',
        destination: 'New York, US',
        eta: in2Days,
        status: 'at_risk' as ShipmentStatus,
        risk_score: 78,
        value: 3400000,
      },
      {
        user_id: userId,
        shipment_code: 'SHP-AUTO-1092',
        origin: 'Stuttgart, DE',
        destination: 'Atlanta, US',
        eta: in12Hours,
        status: 'delayed' as ShipmentStatus,
        risk_score: 92,
        value: 850000,
      }
    ];

    const { data: insertedShipments, error: shpError } = await supabase
      .from('shipments')
      .insert(shipmentsData)
      .select();

    if (shpError || !insertedShipments) throw new Error(shpError?.message || 'Failed to insert shipments');

    const [elecId, pharmId, autoId] = insertedShipments.map(s => s.id);

    // 4. Generate Events
    const eventsData = [
      {
        shipment_id: pharmId,
        type: 'weather' as EventType,
        severity: 'high' as Severity,
        description: 'Severe winter storm approaching North Atlantic shipping lanes.'
      },
      {
        shipment_id: autoId,
        type: 'customs' as EventType,
        severity: 'medium' as Severity,
        description: 'Random customs inspection triggered at Port of Atlanta.'
      },
      {
        shipment_id: elecId,
        type: 'congestion' as EventType,
        severity: 'low' as Severity,
        description: 'Minor port congestion expected at Port of Los Angeles upon arrival.'
      }
    ];
    await supabase.from('events').insert(eventsData);

    // 5. Generate Routes
    const routesData = [
      {
        shipment_id: pharmId,
        route_name: 'Standard Sea Freight',
        eta: in2Days,
        risk_score: 78,
        cost: 15000
      },
      {
        shipment_id: pharmId,
        route_name: 'Expedited Air Freight',
        eta: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: 25,
        cost: 45000
      },
      {
        shipment_id: autoId,
        route_name: 'Direct Rail',
        eta: in12Hours,
        risk_score: 92,
        cost: 8000
      }
    ];
    await supabase.from('routes').insert(routesData);

    // 6. Generate Alerts
    const alertsData = [
      {
        shipment_id: pharmId,
        message: 'High risk of delay due to incoming Atlantic storm. Pharmaceuticals require strict temperature control.',
        severity: 'high' as Severity,
        is_active: true
      },
      {
        shipment_id: autoId,
        message: 'Customs inspection delaying clearance by estimated 24 hours.',
        severity: 'medium' as Severity,
        is_active: true
      }
    ];
    await supabase.from('alerts').insert(alertsData);

    // 7. Generate Recommendations
    const recsData = [
      {
        shipment_id: pharmId,
        action_type: 'reroute' as ActionType,
        description: 'Reroute via air freight to avoid North Atlantic storm delay.',
        risk_before: 78,
        risk_after: 25,
        eta_change: -24,
        cost_impact: 30000,
        confidence: 94,
        is_applied: false
      },
      {
        shipment_id: autoId,
        action_type: 'expedite' as ActionType,
        description: 'Expedite customs clearance using preferred broker network.',
        risk_before: 92,
        risk_after: 45,
        eta_change: -12,
        cost_impact: 2500,
        confidence: 82,
        is_applied: false
      }
    ];
    await supabase.from('recommendations').insert(recsData);

    return { success: true, message: 'Demo data seeded successfully' };

  } catch (error: any) {
    console.error('Failed to seed demo data:', error);
    return { success: false, message: error.message };
  }
}
