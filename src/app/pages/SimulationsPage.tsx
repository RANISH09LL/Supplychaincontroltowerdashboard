import { SimulationCenter } from '../components/SimulationCenter';
import { useDashboard } from '../DashboardContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Loader2, Zap, Wind, Ship, TrendingUp } from 'lucide-react';

const SIM_META: Record<string, { label: string; icon: React.ElementType; impact: string; color: string; location: string }> = {
  storm:        { label: 'Severe Storm',   icon: Wind,       impact: '+40% risk spike',      color: 'var(--risk-high)',   location: 'Bay of Bengal' },
  congestion:   { label: 'Port Congestion', icon: Ship,      impact: '+25% delay increase',  color: 'var(--risk-medium)', location: 'Port of LA' },
  delay:        { label: 'Traffic Delay',  icon: Clock,      impact: '+20% transit time',    color: 'var(--risk-medium)', location: 'Trans-Saharan Route' },
  demand_spike: { label: 'Demand Spike',   icon: TrendingUp, impact: '+35% customs backlog', color: 'var(--risk-low)',    location: 'Global' },
};

export default function SimulationsPage() {
  const { userId } = useDashboard();
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('simulations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setHistory(data ?? []);
        setLoadingHistory(false);
      });
  }, [userId]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--foreground)', margin: 0 }}>
          Simulation Center
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>
          Create &amp; run simulations
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Simulation Center Component */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 14,
          border: '1.5px solid var(--border)',
          padding: 24,
          boxShadow: '0 2px 8px rgba(61,90,30,0.06)',
        }}>
          <SimulationCenter />
        </div>

        {/* Right: Simulation History */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 14,
          border: '1.5px solid var(--border)',
          padding: 24,
          boxShadow: '0 2px 8px rgba(61,90,30,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: 'var(--foreground)', margin: 0 }}>
              Simulation History
            </h3>
            <button style={{ fontSize: 12, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              View All
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <Loader2 style={{ width: 22, height: 22, color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', opacity: 0.5 }}>
              <Zap style={{ width: 32, height: 32, margin: '0 auto 10px', color: 'var(--muted-foreground)' }} />
              <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>No simulations run yet.</p>
              <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>Use the panel to run your first simulation.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((sim) => {
                const meta = SIM_META[sim.type] ?? { label: sim.type, icon: Zap, impact: '—', color: 'var(--muted-foreground)', location: '' };
                const Icon = meta.icon;
                return (
                  <div key={sim.id} style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30,
                          borderRadius: 8,
                          background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon style={{ width: 14, height: 14, color: meta.color }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>{meta.label}</p>
                          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0 }}>{meta.location}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', flexShrink: 0 }}>
                        {new Date(sim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted-foreground)', paddingLeft: 40 }}>
                      <span>Impact: {sim.impact_factor}×</span>
                      <span style={{ fontWeight: 700, color: meta.color }}>{meta.impact}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
