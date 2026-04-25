import { TradeoffExplorer } from '../components/TradeoffExplorer';
import { useDashboard } from '../DashboardContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, DollarSign, Loader2, Route, Navigation2 } from 'lucide-react';

export default function RoutesPage() {
  const { userId, shipments } = useDashboard();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || shipments.length === 0) return;
    const ids = shipments.map((s) => s.id);
    supabase
      .from('routes')
      .select('*, shipments(shipment_code, origin, destination)')
      .in('shipment_id', ids)
      .order('risk_score', { ascending: false })
      .then(({ data }) => {
        setRoutes(data ?? []);
        setLoading(false);
      });
  }, [userId, shipments]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Routes</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Active shipping routes and alternative path recommendations</p>
        </div>
        <span className="text-[12px] text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          {routes.length} routes tracked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : routes.length === 0 ? (
          <div className="col-span-2 bg-card rounded-lg p-10 border border-border text-center">
            <Route className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-[13px] text-muted-foreground">No route alternatives found for your shipments.</p>
          </div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="bg-card rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {route.shipments?.shipment_code ?? 'Route'}
                    </p>
                  </div>
                  <h3 className="text-[15px] text-foreground font-medium">{route.route_name}</h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Navigation2 className="w-3 h-3" />
                    {route.shipments?.origin ?? '—'} → {route.shipments?.destination ?? '—'}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium flex-shrink-0 ${
                  route.risk_score >= 60 ? 'bg-[var(--risk-high)]/10 text-[var(--risk-high)]'
                  : route.risk_score >= 35 ? 'bg-[var(--risk-medium)]/10 text-[var(--risk-medium)]'
                  : 'bg-[var(--risk-low)]/10 text-[var(--risk-low)]'
                }`}>
                  Risk {route.risk_score}
                </span>
              </div>
              <div className="h-px bg-border my-3" />
              <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  ETA {new Date(route.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${(route.cost ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <TradeoffExplorer />
    </div>
  );
}
