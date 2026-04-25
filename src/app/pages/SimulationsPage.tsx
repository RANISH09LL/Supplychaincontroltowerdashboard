import { SimulationCenter } from '../components/SimulationCenter';
import { useDashboard } from '../DashboardContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, PlayCircle, Loader2, Zap, Wind, Ship, TrendingUp } from 'lucide-react';

const SIM_META: Record<string, { label: string; icon: React.ElementType; impact: string; color: string }> = {
  storm:        { label: 'Severe Storm Event',   icon: Wind,      impact: '+40% risk spike',         color: 'var(--risk-high)' },
  congestion:   { label: 'Port Congestion',      icon: Ship,      impact: '+25% delay increase',     color: 'var(--risk-medium)' },
  delay:        { label: 'Systemic Delay',       icon: Clock,     impact: '+20% transit time',       color: 'var(--risk-medium)' },
  demand_spike: { label: 'Demand Spike',         icon: TrendingUp,impact: '+15% customs backlog',    color: 'var(--risk-low)' },
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Simulation Center</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Model disruptions and stress-test your supply chain</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <PlayCircle className="w-4 h-4" /> New Simulation
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SimulationCenter />

        {/* Live Simulation History */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] text-foreground font-display">Simulation History</h3>
            <span className="text-[12px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              {history.length} runs
            </span>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-[13px] text-muted-foreground">No simulations run yet.</p>
              <p className="text-[12px] text-muted-foreground mt-1">Use the panel to run your first simulation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((sim) => {
                const meta = SIM_META[sim.type] ?? { label: sim.type, icon: Zap, impact: '—', color: 'var(--muted-foreground)' };
                const Icon = meta.icon;
                return (
                  <div key={sim.id} className="p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        </div>
                        <p className="text-[13px] text-foreground font-medium">{meta.label}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                        {new Date(sim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-muted-foreground ml-9">
                      <span>Impact factor: {sim.impact_factor}×</span>
                      <span className="font-medium" style={{ color: meta.color }}>{meta.impact}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
