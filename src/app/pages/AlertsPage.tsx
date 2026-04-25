import { AlertsPanel } from '../components/AlertsPanel';
import { useDashboard } from '../DashboardContext';
import { Bell, Filter, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function AlertsPage() {
  const { alerts } = useDashboard();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Alerts</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Monitor and manage supply chain alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-[13px] font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--risk-high)]/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[var(--risk-high)]" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Critical</p>
              <p className="text-[20px] font-display text-foreground">{alerts.filter(a => a.severity === 'high').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--risk-medium)]/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[var(--risk-medium)]" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Warning</p>
              <p className="text-[20px] font-display text-foreground">{alerts.filter(a => a.severity === 'medium').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--risk-low)]/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-[var(--risk-low)]" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Info</p>
              <p className="text-[20px] font-display text-foreground">{alerts.filter(a => a.severity === 'low').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Resolved</p>
              <p className="text-[20px] font-display text-foreground">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert list */}
      <AlertsPanel />
    </div>
  );
}
