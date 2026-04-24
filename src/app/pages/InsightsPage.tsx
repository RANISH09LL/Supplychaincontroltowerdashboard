import { InsightsPanel } from '../components/InsightsPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const detailedTrend = [
  { day: 'May 14', risk: 52, shipments: 120 },
  { day: 'May 15', risk: 58, shipments: 125 },
  { day: 'May 16', risk: 65, shipments: 118 },
  { day: 'May 17', risk: 72, shipments: 130 },
  { day: 'May 18', risk: 68, shipments: 128 },
  { day: 'May 19', risk: 55, shipments: 122 },
  { day: 'May 20', risk: 47, shipments: 132 },
];

const keyInsights = [
  { title: 'Bay of Bengal routes carry 70% higher risk', trend: 'up', category: 'Route Risk' },
  { title: 'LA Port congestion improved 12% this week', trend: 'down', category: 'Port Health' },
  { title: 'On-time delivery rate stable at 82%', trend: 'flat', category: 'Performance' },
  { title: 'Weather disruptions expected next 48hrs', trend: 'up', category: 'Forecast' },
];

export default function InsightsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Insights</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Supply chain intelligence</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors">
          View Full Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main chart area — 2 cols */}
        <div className="col-span-2 space-y-6">
          {/* Trend chart */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[16px] font-display text-foreground mb-1">Risk Trend Analysis</h3>
            <p className="text-[12px] text-muted-foreground mb-5">7-day rolling analysis</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={detailedTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', padding: '8px 12px' }} />
                <Line type="monotone" dataKey="risk" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key insights list */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h3 className="text-[16px] font-display text-foreground mb-4">Key Insights</h3>
            <div className="space-y-3">
              {keyInsights.map((insight, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${insight.trend === 'up' ? 'bg-[var(--risk-high)]/10' : insight.trend === 'down' ? 'bg-[var(--risk-low)]/10' : 'bg-muted/40'}`}>
                    {insight.trend === 'up' ? <TrendingUp className="w-4 h-4 text-[var(--risk-high)]" /> : insight.trend === 'down' ? <TrendingDown className="w-4 h-4 text-[var(--risk-low)]" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-foreground font-medium">{insight.title}</p>
                    <p className="text-[11px] text-muted-foreground">{insight.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Summary panel */}
        <InsightsPanel />
      </div>
    </div>
  );
}
