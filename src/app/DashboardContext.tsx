// src/app/DashboardContext.tsx
// ============================================================
// DASHBOARD CONTEXT — global state + data layer
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useAuth }      from '../hooks/useAuth';
import { useRealtime }  from '../hooks/useRealtime';
import { getDashboardData } from '../services/dashboardService';
import { triggerSimulation } from '../services/simulationService';
import { applyRecommendation } from '../services/recommendationService';
import { createSnapshot }  from '../services/snapshotService';
import { logoutUser }      from '../services/authService';

import type {
  DashboardData,
  DashboardMetrics,
  Shipment,
  Alert,
  Recommendation,
  TradeOffOption,
  SimulationType,
} from '../types';

// ─── Context shape ───────────────────────────────────────────

interface DashboardContextValue {
  // Auth
  userId:  string | null;
  loading: boolean;
  logout:  () => Promise<void>;

  // Data
  shipments:       Shipment[];
  alerts:          Alert[];
  recommendations: Recommendation[];
  tradeOffOptions: TradeOffOption[];
  metrics:         DashboardMetrics | null;
  dataError:       string | null;
  activeSimulationInsight: string | null;

  // Actions
  refresh:              () => Promise<void>;
  runSimulation:        (type: SimulationType) => Promise<string | null>;
  applyRec:             (rec_id: string) => Promise<string | null>;
  takeSnapshot:         (name: string) => Promise<string | null>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [data,      setData]      = useState<DashboardData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [fetching,  setFetching]  = useState(false);
  const [activeSimulationInsight, setActiveSimulationInsight] = useState<string | null>(null);

  // ── Fetch / refresh ──────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    const { data: d, error } = await getDashboardData(user.id);
    setData(d);
    setDataError(error);
    setFetching(false);
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  // ── Realtime ─────────────────────────────────────────────
  useRealtime({
    onShipmentChange: refresh,
    onAlertChange:    refresh,
    onRecChange:      refresh,
  });

  // ── Actions ──────────────────────────────────────────────

  async function logout() {
    await logoutUser();
  }

  async function runSimulation(type: SimulationType): Promise<string | null> {
    if (!user) return 'Not authenticated';
    const { data, error } = await triggerSimulation(type, user.id);
    if (!error) {
      if (data?.insightSummary) setActiveSimulationInsight(data.insightSummary);
      await refresh();
    }
    return error;
  }

  async function applyRec(rec_id: string): Promise<string | null> {
    if (!user) return 'Not authenticated';
    const { error } = await applyRecommendation(rec_id, user.id);
    if (!error) await refresh();
    return error;
  }

  async function takeSnapshot(name: string): Promise<string | null> {
    if (!user) return 'Not authenticated';
    const { error } = await createSnapshot(user.id, name);
    return error;
  }

  // ─────────────────────────────────────────────────────────
  const value: DashboardContextValue = {
    userId:  user?.id ?? null,
    loading: authLoading || fetching,
    logout,

    shipments:       data?.shipments       ?? [],
    alerts:          data?.alerts          ?? [],
    recommendations: data?.recommendations ?? [],
    tradeOffOptions: data?.trade_off_options ?? [],
    metrics:         data?.metrics         ?? null,
    dataError,
    activeSimulationInsight,

    refresh,
    runSimulation,
    applyRec,
    takeSnapshot,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// ─── Consumer hook ───────────────────────────────────────────

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>');
  return ctx;
}
