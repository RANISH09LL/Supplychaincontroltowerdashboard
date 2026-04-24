import { AlertTriangle } from 'lucide-react';

const issues = [
  { id: 1, severity: 'High', title: 'Severe Weather Warning', description: 'Affects 12 shipments', color: 'var(--risk-high)' },
  { id: 2, severity: 'Medium', title: 'Port Congestion', description: 'Affects 7 shipments', color: 'var(--risk-medium)' },
  { id: 3, severity: 'Medium', title: 'Route Delay', description: 'Affects 4 shipments', color: 'var(--risk-medium)' },
];

export function CriticalIssues() {
  return (
    <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
      <h3 className="text-[17px] text-foreground font-display mb-0.5">Top 3 Critical Issues</h3>
      <p className="text-[12px] text-muted-foreground font-medium mb-4">Shipment #SH-78291</p>
      <div className="space-y-2.5">
        {issues.map((issue) => (
          <div key={issue.id} className="flex gap-3 p-3.5 rounded-lg bg-muted/15 border border-border/50 hover:bg-muted/30 transition-all duration-200 cursor-pointer group">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" style={{ color: issue.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-[13px] text-foreground font-semibold">{issue.title}</h4>
                <span
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: issue.color }}
                >
                  {issue.severity}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground font-medium">{issue.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 px-4 py-2.5 text-[13px] text-primary font-bold border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200">
        View All Alerts
      </button>
    </div>
  );
}
