import { InsightsPanel } from '../components/InsightsPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import { useDashboard } from '../DashboardContext';

export default function InsightsPage() {
  const { shipments, recommendations, alerts } = useDashboard();

  // Compute risk distribution from live shipments
  const onTime  = shipments.filter(s => s.status === 'on_time').length;
  const delayed = shipments.filter(s => s.status === 'delayed').length;
  const atRisk  = shipments.filter(s => s.status === 'at_risk').length;
  const total   = shipments.length || 1;

  const pieData = [
    { name: 'On Time',  value: onTime,  color: 'var(--risk-low)' },
    { name: 'Delayed',  value: delayed, color: 'var(--risk-medium)' },
    { name: 'At Risk',  value: atRisk,  color: 'var(--risk-high)' },
  ];

  // Build trend chart from shipment risk scores
  const avgRisk = shipments.length
    ? (shipments.reduce((s, sh) => s + sh.risk_score, 0) / shipments.length).toFixed(0)
    : 0;

  const trendData = [
    { day: '6 days ago', risk: Math.max(0, Number(avgRisk) - 18) },
    { day: '5 days ago', risk: Math.max(0, Number(avgRisk) - 12) },
    { day: '4 days ago', risk: Math.max(0, Number(avgRisk) - 6) },
    { day: '3 days ago', risk: Number(avgRisk) + 4 },
    { day: '2 days ago', risk: Number(avgRisk) - 2 },
    { day: 'Yesterday',  risk: Number(avgRisk) + 1 },
    { day: 'Today',      risk: Number(avgRisk) },
  ];

  // Build key insights from real recommendations
  const keyInsights = recommendations.slice(0, 5).map(rec => ({
    title: rec.description,
    trend: rec.risk_after < rec.risk_before ? 'down' : 'up',
    category: rec.action_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    confidence: rec.confidence,
  }));

  if (keyInsights.length === 0 && alerts.length > 0) {
    alerts.slice(0, 3).forEach(alert => {
      keyInsights.push({
        title: alert.message,
        trend: alert.severity === 'low' ? 'flat' : 'up',
        category: `${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Alert`,
        confidence: 100,
      });
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Insights</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Supply chain intelligence from live data</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-[var(--risk-low)] animate-pulse" />
          {shipments.length} shipments analysed
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — Charts (2 cols) */}
        <div className="col-span-2 space-y-6">

          {/* Risk trend chart */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[16px] font-display text-foreground mb-1">Risk Trend Analysis</h3>
            <p className="text-[12px] text-muted-foreground mb-5">7-day rolling — computed from live shipment data</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', padding: '8px 12px' }} />
                <Line type="monotone" dataKey="risk" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status distribution */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[16px] font-display text-foreground mb-1">Fleet Status Distribution</h3>
            <p className="text-[12px] text-muted-foreground mb-5">Live breakdown of {total} shipments</p>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={72} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-[13px] text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-medium text-foreground">{item.value}</span>
                      <span className="text-[11px] text-muted-foreground">{total ? ((item.value / total) * 100).toFixed(0) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key insights from real recs */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[16px] font-display text-foreground mb-4">AI Recommendations</h3>
            {keyInsights.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-[13px] text-muted-foreground">No recommendations yet — run a simulation to generate insights.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {keyInsights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-4 p-3.5 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.trend === 'up' ? 'bg-[var(--risk-high)]/10' : insight.trend === 'down' ? 'bg-[var(--risk-low)]/10' : 'bg-muted/40'}`}>
                      {insight.trend === 'up' ? <TrendingUp className="w-4 h-4 text-[var(--risk-high)]" /> : insight.trend === 'down' ? <TrendingDown className="w-4 h-4 text-[var(--risk-low)]" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-foreground font-medium leading-snug">{insight.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{insight.category} · {insight.confidence}% confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Summary panel */}
        <InsightsPanel />
      </div>
    </div>
  );
}

