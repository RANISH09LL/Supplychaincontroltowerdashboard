import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { id: 1, time: '12 AM', risk: 45 },
  { id: 2, time: '4 AM', risk: 62 },
  { id: 3, time: '8 AM', risk: 85 },
  { id: 4, time: '12 PM', risk: 65 },
  { id: 5, time: '4 PM', risk: 48 },
  { id: 6, time: '8 PM', risk: 38 },
];

export function RiskChart() {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[17px] text-foreground font-display mb-0.5">Risk Overview</h3>
          <p className="text-[12px] text-muted-foreground font-medium">
            10:00 AM · Risk Score: <span className="text-foreground font-bold">65</span>
          </p>
        </div>
        <select className="px-3 py-1.5 bg-card rounded-lg text-[12px] text-foreground border border-border outline-none hover:border-primary/40 transition-colors cursor-pointer font-semibold">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip
            cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '8px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
          />
          <Line type="monotone" dataKey="risk" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
