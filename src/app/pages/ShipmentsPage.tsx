import { useDashboard } from '../DashboardContext';
import { ArrowRight, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';

const riskBreakdown = [
  { label: 'Weather', value: 45, color: 'var(--risk-high)' },
  { label: 'Port Congestion', value: 25, color: 'var(--risk-medium)' },
  { label: 'Route Delay', value: 20, color: 'var(--risk-medium)' },
  { label: 'Other Factors', value: 10, color: 'var(--risk-low)' },
];

const timeline = [
  { date: 'May 14', time: '09:00 UAM', event: 'Shipment picked up', location: 'Mumbai, IN', status: 'done' },
  { date: 'May 15', time: '13:00 PM', event: 'Departed from origin port', location: 'Mumbai Port', status: 'done' },
  { date: 'May 17', time: '10:00 AM', event: 'Weather delay', location: 'Bay of Bengal', status: 'warning' },
  { date: 'May 19', time: '—', event: 'Arrived at transshipment port', location: 'Colombo, LK', status: 'pending' },
];

export default function ShipmentsPage() {
  const { shipments } = useDashboard();
  const selected = shipments[0]; // Default to first shipment

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-4 font-medium">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Shipments</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-bold">{selected.id}</span>
      </div>

      <h1 className="text-[24px] text-foreground font-display mb-6">Shipment Detail</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — Shipment info + timeline */}
        <div className="col-span-2 space-y-6">
          {/* Shipment header card */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-[18px] font-display text-foreground">Shipment</h2>
                  <span className="text-[18px] font-display text-foreground font-bold">{selected.id}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold text-white ${selected.status === 'At Risk' ? 'bg-[var(--risk-high)]' : selected.status === 'Delayed' ? 'bg-[var(--risk-medium)]' : 'bg-[var(--risk-low)]'}`}>
                    {selected.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-foreground">
                  <span>{selected.origin}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span>{selected.destination}</span>
                </div>
                <div className="flex items-center gap-6 mt-3 text-[12px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ETA: {selected.eta}</span>
                  <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> ${selected.value.toLocaleString()}</span>
                </div>
              </div>
              {/* Risk Donut */}
              <div className="flex flex-col items-center">
                <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-[0.1em] font-bold">Risk Score</p>
                <div className="w-20 h-20 rounded-full border-4 border-[var(--risk-high)] flex items-center justify-center bg-[var(--risk-high)]/5">
                  <span className="text-[26px] font-display text-[var(--risk-high)]">{Math.round(selected.riskScore)}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-t border-border pt-3 mt-3">
              {['Overview', 'Events', 'Route', 'Recommendations'].map((tab, i) => (
                <button key={tab} className={`px-4 py-2 rounded-md text-[12px] font-bold transition-colors ${i === 0 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/30'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Events Timeline */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[17px] font-display text-foreground mb-5">Events Timeline</h3>
            <div className="space-y-0">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-4 pb-5 last:pb-0">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${event.status === 'done' ? 'bg-primary border-primary' : event.status === 'warning' ? 'bg-[var(--risk-medium)] border-[var(--risk-medium)]' : 'bg-muted border-border'}`} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-foreground font-bold">{event.event}</p>
                      <span className="text-[11px] text-muted-foreground">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[12px] text-muted-foreground">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-bold shadow-md hover:bg-primary/85 transition-all duration-200">
              Explore Path
            </button>
          </div>
        </div>

        {/* Right — Risk breakdown */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[17px] font-display text-foreground mb-5">Risk Breakdown</h3>
            <div className="space-y-4">
              {riskBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-foreground font-semibold">{item.label}</span>
                    <span className="text-[12px] text-foreground font-bold">{item.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All shipments list */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[16px] font-display text-foreground mb-4">All Shipments</h3>
            <div className="space-y-2">
              {shipments.map((s) => (
                <button key={s.id} className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${s.id === selected.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/20'}`}>
                  <div className="text-left">
                    <p className="text-[13px] text-foreground font-bold">{s.id}</p>
                    <p className="text-[11px] text-muted-foreground">{s.origin} → {s.destination}</p>
                  </div>
                  <span className={`text-[13px] font-black ${s.riskScore >= 70 ? 'text-[var(--risk-high)]' : s.riskScore >= 40 ? 'text-[var(--risk-medium)]' : 'text-[var(--risk-low)]'}`}>
                    {Math.round(s.riskScore)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
