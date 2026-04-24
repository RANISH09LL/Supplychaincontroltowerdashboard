import { Clock, Eye } from 'lucide-react';

const snapshots = [
  { id: 1, name: 'Pre-Storm Baseline', date: 'May 14, 2024 — 09:00 AM', metrics: { shipments: 128, risk: 42, onTime: '87%' } },
  { id: 2, name: 'Post-Storm Impact', date: 'May 15, 2024 — 02:00 PM', metrics: { shipments: 128, risk: 72, onTime: '68%' } },
  { id: 3, name: 'Recovery Checkpoint', date: 'May 18, 2024 — 10:00 AM', metrics: { shipments: 132, risk: 55, onTime: '78%' } },
  { id: 4, name: 'Weekly Review', date: 'May 20, 2024 — 06:00 PM', metrics: { shipments: 135, risk: 47, onTime: '82%' } },
];

export default function SnapshotsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Snapshots</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Saved states of your supply chain for comparison</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors">
          Take Snapshot
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {snapshots.map((snap) => (
          <div key={snap.id} className="bg-card rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[15px] text-foreground font-medium mb-1">{snap.name}</h3>
                <p className="text-[12px] text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {snap.date}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-all">
                <Eye className="w-4 h-4 text-primary" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Shipments</p>
                <p className="text-[16px] font-display text-foreground">{snap.metrics.shipments}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Avg Risk</p>
                <p className={`text-[16px] font-display ${snap.metrics.risk >= 60 ? 'text-[var(--risk-high)]' : snap.metrics.risk >= 40 ? 'text-[var(--risk-medium)]' : 'text-[var(--risk-low)]'}`}>{snap.metrics.risk}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">On-Time</p>
                <p className="text-[16px] font-display text-foreground">{snap.metrics.onTime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
