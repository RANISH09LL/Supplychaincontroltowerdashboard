import { TradeoffExplorer } from '../components/TradeoffExplorer';
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react';

const routes = [
  { id: 'RT-01', name: 'Mumbai → Rotterdam', distance: '7,200 nm', duration: '18 days', risk: 72, status: 'Active' },
  { id: 'RT-02', name: 'Shanghai → Los Angeles', distance: '6,300 nm', duration: '14 days', risk: 35, status: 'Active' },
  { id: 'RT-03', name: 'Hamburg → New York', distance: '3,800 nm', duration: '10 days', risk: 18, status: 'Active' },
  { id: 'RT-04', name: 'Dubai → London', distance: '6,100 nm', duration: '16 days', risk: 55, status: 'Monitoring' },
];

export default function RoutesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Routes</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Active shipping routes and recommendations</p>
        </div>
      </div>

      {/* Route cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {routes.map((route) => (
          <div key={route.id} className="bg-card rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{route.id}</p>
                <h3 className="text-[15px] text-foreground font-medium">{route.name}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium ${route.risk >= 50 ? 'bg-[var(--risk-high)]/10 text-[var(--risk-high)]' : route.risk >= 30 ? 'bg-[var(--risk-medium)]/10 text-[var(--risk-medium)]' : 'bg-[var(--risk-low)]/10 text-[var(--risk-low)]'}`}>
                Risk: {route.risk}
              </span>
            </div>
            <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /> {route.distance}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {route.duration}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {route.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <TradeoffExplorer />
    </div>
  );
}
