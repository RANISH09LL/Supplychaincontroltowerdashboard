// src/types/index.ts
// ============================================================
// SUPPLY CHAIN CONTROL TOWER — SHARED TYPES
// ============================================================

// ─── Auth & Profiles ────────────────────────────────────────

export type PlanLevel = 'free' | 'basic' | 'pro';

export interface Profile {
  id: string;
  plan_level: PlanLevel;
  total_simulations_run: number;
  created_at: string;
}

// ─── Shipments ──────────────────────────────────────────────

export type ShipmentStatus = 'on_time' | 'delayed' | 'at_risk';

export interface Shipment {
  id: string;
  user_id: string;
  shipment_code: string;
  origin: string;
  destination: string;
  eta: string;           // ISO timestamp
  status: ShipmentStatus;
  risk_score: number;    // 0–100
  value: number;
  dependency_id: string | null;
  created_at: string;
}

export interface CreateShipmentInput {
  shipment_code: string;
  origin: string;
  destination: string;
  eta: string;
  value: number;
  dependency_id?: string;
}

// ─── Events ─────────────────────────────────────────────────

export type EventType = 'weather' | 'delay' | 'congestion' | 'customs';
export type Severity   = 'low' | 'medium' | 'high';

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  type: EventType;
  severity: Severity;
  description: string;
  created_at: string;
}

// ─── Routes ─────────────────────────────────────────────────

export interface Route {
  id: string;
  shipment_id: string;
  route_name: string;
  eta: string;
  risk_score: number;
  cost: number;
  created_at: string;
}

// ─── Alerts ─────────────────────────────────────────────────

export interface Alert {
  id: string;
  shipment_id: string;
  message: string;
  severity: Severity;
  is_active: boolean;
  created_at: string;
  // joined from shipments (optional)
  shipment?: Pick<Shipment, 'shipment_code' | 'origin' | 'destination'>;
}

// ─── Recommendations ────────────────────────────────────────

export type ActionType = 'reroute' | 'delay_mitigation' | 'expedite' | 'hold';

export interface Recommendation {
  id: string;
  shipment_id: string;
  action_type: ActionType;
  description: string;
  risk_before: number;
  risk_after: number;
  eta_change: number;    // hours; negative = faster delivery
  cost_impact: number;
  confidence: number;    // 0–100
  is_applied: boolean;
  created_at: string;
}

// ─── Trade-Off Options ──────────────────────────────────────

export interface TradeOffOption {
  route_id: string;
  route_name: string;
  eta: string;
  risk_score: number;
  cost: number;
  confidence: number;
  is_best: boolean;
}

// ─── Simulations ────────────────────────────────────────────

export type SimulationType = 'storm' | 'congestion' | 'delay' | 'demand_spike';

export interface Simulation {
  id: string;
  user_id: string;
  type: SimulationType;
  impact_factor: number;
  created_at: string;
}

// ─── Snapshots ──────────────────────────────────────────────

export interface Snapshot {
  id: string;
  user_id: string;
  name: string;
  state_json: DashboardData;
  created_at: string;
}

// ─── Audit Logs ─────────────────────────────────────────────

export interface AuditLog {
  id: string;
  shipment_id: string | null;
  user_id: string | null;
  action: string;
  result: string;
  created_at: string;
}

// ─── Dashboard ──────────────────────────────────────────────

export interface DashboardMetrics {
  total_shipments: number;
  at_risk_count: number;
  delayed_count: number;
  on_time_count: number;
  total_value_at_risk: number;
  total_cost_of_delay: number;
}

export interface DashboardData {
  shipments: Shipment[];
  alerts: Alert[];
  recommendations: Recommendation[];
  trade_off_options: TradeOffOption[];
  metrics: DashboardMetrics;
}

// ─── Service Results ─────────────────────────────────────────

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}
