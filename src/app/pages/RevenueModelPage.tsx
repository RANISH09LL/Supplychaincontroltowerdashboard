import { useState, useMemo } from 'react';
import { useDashboard } from '../DashboardContext';
import { DollarSign, TrendingUp, TrendingDown, Activity, AlertCircle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function RevenueModelPage() {
  const { shipments } = useDashboard();
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '12m'>('30d');

  // Compute realistic revenue/cost data from live shipments
  const { totalRevenue, totalCost, costAtRisk, delayedPenalty } = useMemo(() => {
    let rev = 0;
    let cost = 0;
    let risk = 0;
    let penalty = 0;
    
    shipments.forEach(s => {
      const baseCost = s.value || 0;
      cost += baseCost;
      
      // Assume a 25% gross margin on average
      rev += baseCost * 1.25; 

      if (s.status === 'at_risk') {
        risk += baseCost * 0.15; // 15% value at risk roughly
      }
      if (s.status === 'delayed') {
        penalty += baseCost * 0.05; // 5% late penalty
      }
    });

    return { 
      totalRevenue: rev, 
      totalCost: cost, 
      costAtRisk: risk, 
      delayedPenalty: penalty 
    };
  }, [shipments]);

  const grossProfit = totalRevenue - totalCost - delayedPenalty;
  const margin = totalRevenue ? (grossProfit / totalRevenue) * 100 : 0;

  // Mocked historical data for charts
  const periodMultiplier = timeframe === '30d' ? 1 : timeframe === '90d' ? 3 : 12;
  const historicalData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      if (timeframe === '12m') {
        date.setMonth(date.getMonth() - (6 - i));
      } else {
        date.setDate(date.getDate() - (6 - i) * (periodMultiplier * 4));
      }
      
      // Scale variations
      const revScale = (totalRevenue / 7) * (0.8 + Math.random() * 0.4);
      const costScale = (totalCost / 7) * (0.8 + Math.random() * 0.4);

      return {
        name: timeframe === '12m' 
          ? date.toLocaleDateString('en-US', { month: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revScale,
        cost: costScale,
        profit: revScale - costScale
      };
    });
  }, [timeframe, totalRevenue, totalCost, periodMultiplier]);

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Revenue Model</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Live profitability and cost-efficiency analysis</p>
        </div>
        <div className="flex bg-muted/40 p-1 rounded-lg border border-border">
          {(['30d', '90d', '12m'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                timeframe === t 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-wider font-medium">Gross Revenue</span>
          </div>
          <p className="text-[24px] font-display text-foreground">{formatCurrency(totalRevenue)}</p>
          <p className="text-[12px] text-[var(--risk-low)] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +8.4%
          </p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-wider font-medium">Total Cost</span>
          </div>
          <p className="text-[24px] font-display text-foreground">{formatCurrency(totalCost)}</p>
          <p className="text-[12px] text-[var(--risk-medium)] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +2.1%
          </p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-wider font-medium">Est. Profit Margin</span>
          </div>
          <p className="text-[24px] font-display text-foreground">{margin.toFixed(1)}%</p>
          <p className="text-[12px] text-[var(--risk-low)] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +1.2 pts
          </p>
        </div>
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-[var(--risk-high)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-[var(--risk-high)]" />
            <span className="text-[11px] uppercase tracking-wider font-medium">Cost at Risk</span>
          </div>
          <p className="text-[24px] font-display text-[var(--risk-high)]">{formatCurrency(costAtRisk + delayedPenalty)}</p>
          <p className="text-[12px] text-muted-foreground mt-1">Avoidable penalties & delays</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="col-span-2 bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-display text-foreground mb-1">Revenue vs. Cost Flow</h3>
              <p className="text-[12px] text-muted-foreground">Financial performance over selected period</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--risk-medium)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--risk-medium)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [`$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="cost" name="Cost" stroke="var(--risk-medium)" fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit breakdown side panel */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[16px] font-display text-foreground mb-4">Profit Breakdown</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData.slice(-4)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={5} />
                  <Tooltip 
                    cursor={{ fill: 'var(--border)', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val: number) => [`$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Profit']}
                  />
                  <Bar dataKey="profit" fill="var(--risk-low)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
            <h3 className="text-[14px] font-display text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" /> Period Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">Operating Cost</span>
                <span className="text-[13px] font-medium text-foreground">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">Delay Penalties</span>
                <span className="text-[13px] font-medium text-[var(--risk-medium)]">-{formatCurrency(delayedPenalty)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[12px] font-medium text-foreground">Net Forecast</span>
                <span className="text-[14px] font-display text-foreground">{formatCurrency(grossProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
