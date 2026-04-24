-- ============================================================
-- SUPPLY CHAIN CONTROL TOWER — SUPABASE SQL SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_level  TEXT NOT NULL DEFAULT 'free' CHECK (plan_level IN ('free', 'basic', 'pro')),
  total_simulations_run INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, plan_level, total_simulations_run)
  VALUES (NEW.id, 'free', 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SHIPMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS shipments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_code   TEXT NOT NULL,
  origin          TEXT NOT NULL,
  destination     TEXT NOT NULL,
  eta             TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'on_time' CHECK (status IN ('on_time', 'delayed', 'at_risk')),
  risk_score      INT NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  value           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  dependency_id   UUID REFERENCES shipments(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_dependency_id ON shipments(dependency_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id  UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('weather', 'delay', 'congestion', 'customs')),
  severity     TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description  TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_shipment_id ON events(shipment_id);

-- ============================================================
-- ROUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id  UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  route_name   TEXT NOT NULL,
  eta          TIMESTAMPTZ NOT NULL,
  risk_score   INT NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  cost         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_shipment_id ON routes(shipment_id);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id  UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  severity     TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_shipment_id ON alerts(shipment_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id  UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  action_type  TEXT NOT NULL CHECK (action_type IN ('reroute', 'delay_mitigation', 'expedite', 'hold')),
  description  TEXT NOT NULL,
  risk_before  INT NOT NULL DEFAULT 0,
  risk_after   INT NOT NULL DEFAULT 0,
  eta_change   INT NOT NULL DEFAULT 0,     -- hours (negative = faster)
  cost_impact  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  confidence   INT NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  is_applied   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_shipment_id ON recommendations(shipment_id);

-- ============================================================
-- SIMULATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS simulations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('storm', 'congestion', 'delay', 'demand_spike')),
  impact_factor  NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS snapshots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  state_json  JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id  UUID REFERENCES shipments(id) ON DELETE SET NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  result       TEXT NOT NULL DEFAULT 'success',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_shipment_id ON audit_logs(shipment_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "profiles_self" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Shipments: users can only access their own
CREATE POLICY "shipments_self" ON shipments
  FOR ALL USING (auth.uid() = user_id);

-- Events: access via shipment ownership
CREATE POLICY "events_via_shipment" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM shipments s WHERE s.id = events.shipment_id AND s.user_id = auth.uid())
  );

-- Routes: access via shipment ownership
CREATE POLICY "routes_via_shipment" ON routes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM shipments s WHERE s.id = routes.shipment_id AND s.user_id = auth.uid())
  );

-- Alerts: access via shipment ownership
CREATE POLICY "alerts_via_shipment" ON alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM shipments s WHERE s.id = alerts.shipment_id AND s.user_id = auth.uid())
  );

-- Recommendations: access via shipment ownership
CREATE POLICY "recommendations_via_shipment" ON recommendations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM shipments s WHERE s.id = recommendations.shipment_id AND s.user_id = auth.uid())
  );

-- Simulations: users can only access their own
CREATE POLICY "simulations_self" ON simulations
  FOR ALL USING (auth.uid() = user_id);

-- Snapshots: users can only access their own
CREATE POLICY "snapshots_self" ON snapshots
  FOR ALL USING (auth.uid() = user_id);

-- Audit logs: users can only see their own
CREATE POLICY "audit_logs_self" ON audit_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME (enable for live updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE recommendations;
