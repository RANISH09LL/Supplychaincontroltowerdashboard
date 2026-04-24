import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, Calendar } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', shipments: 340, onTime: 285, delayed: 55 },
  { month: 'Feb', shipments: 310, onTime: 270, delayed: 40 },
  { month: 'Mar', shipments: 380, onTime: 310, delayed: 70 },
  { month: 'Apr', shipments: 420, onTime: 365, delayed: 55 },
  { month: 'May', shipments: 390, onTime: 320, delayed: 70 },
];

export default function ReportsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Reports</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Performance analytics and export tools</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-[13px] font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" /> This Month
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Performance chart */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm mb-6">
        <h3 className="text-[16px] font-display text-foreground mb-1">Monthly Performance</h3>
        <p className="text-[12px] text-muted-foreground mb-5">Shipment delivery breakdown</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', padding: '8px 12px' }} />
            <Bar dataKey="onTime" fill="var(--primary)" radius={[3, 3, 0, 0]} stackId="a" name="On-Time" />
            <Bar dataKey="delayed" fill="var(--risk-medium)" radius={[3, 3, 0, 0]} stackId="a" name="Delayed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: '1,840', change: '+12%' },
          { label: 'On-Time Rate', value: '83.2%', change: '+2.1%' },
          { label: 'Avg. Transit Time', value: '14.3 days', change: '-0.5 days' },
          { label: 'Cost Efficiency', value: '94.1%', change: '+1.8%' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg p-5 border border-border shadow-sm text-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-[22px] font-display text-foreground mb-1">{stat.value}</p>
            <p className="text-[12px] text-[var(--risk-low)] font-medium">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
