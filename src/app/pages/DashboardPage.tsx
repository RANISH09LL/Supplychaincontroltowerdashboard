import {
  Package, AlertTriangle, DollarSign, TrendingUp,
  Search, Bell, HelpCircle
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { RiskChart } from '../components/RiskChart';
import { ShipmentsTable } from '../components/ShipmentsTable';
import { ActionCard } from '../components/ActionCard';
import { CriticalIssues } from '../components/CriticalIssues';
import { useDashboard } from '../DashboardContext';

export default function DashboardPage() {
  const { metrics, demoMode, generateSampleData } = useDashboard();

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search shipments, routes, events..."
              className="w-full pl-10 pr-4 py-2.5 bg-card rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground border border-border outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-muted-foreground font-medium">System Status</span>
            <span className="text-[var(--risk-low)] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--risk-low)] animate-pulse" />
              Operational
            </span>
          </div>
          <button className="relative p-2.5 hover:bg-muted/50 rounded-lg transition-colors">
            <Bell className="w-[18px] h-[18px] text-foreground/80" strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[var(--risk-high)] rounded-full border-2 border-background" />
          </button>
          <button className="p-2.5 hover:bg-muted/50 rounded-lg transition-colors">
            <HelpCircle className="w-[18px] h-[18px] text-foreground/80" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Welcome + Generate */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="text-[28px] text-foreground font-display leading-[1.15] tracking-tight">Welcome back,</h1>
          <h2 className="text-[28px] text-foreground font-display leading-[1.15] tracking-tight">Operations Team</h2>
          <p className="text-[13px] text-muted-foreground mt-2 font-medium">Here's your supply chain overview.</p>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <p className="text-[11px] text-muted-foreground font-medium">Last updated: Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          <button 
            onClick={generateSampleData}
            className="px-5 py-2.5 bg-card border border-border text-foreground rounded-lg text-[13px] font-semibold hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md"
          >
            ↻ Generate Sample Data
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-5 mb-7">
        <MetricCard title="Total Shipments" value={metrics.totalShipments.toString()} change="+12 vs yesterday" icon={Package} tintColor="bg-primary/8" />
        <MetricCard title="At Risk" value={metrics.atRisk.toString()} change={`${((metrics.atRisk / metrics.totalShipments) * 100).toFixed(1)}% of total`} icon={AlertTriangle} tintColor="bg-[var(--risk-high)]/8" />
        <MetricCard title="Total Value at Risk" value={`$${(metrics.valueAtRisk / 1000000).toFixed(2)}M`} change="+ $320K vs yesterday" icon={DollarSign} tintColor="bg-secondary/30" />
        <MetricCard title="On-Time" value={`${metrics.onTimePercent.toFixed(1)}%`} change="+ 5.4% vs yesterday" icon={TrendingUp} tintColor="bg-accent/15" />
      </div>

      {/* Middle row — 3 columns */}
      <div className="grid grid-cols-3 gap-5 mb-7">
        <RiskChart />
        <CriticalIssues />
        <ActionCard />
      </div>

      {/* Shipments Table */}
      <ShipmentsTable />
    </div>
  );
}
