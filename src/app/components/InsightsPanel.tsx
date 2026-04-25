import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';


const trendData = [
  { id: 1, day: 'May 14', value: 45 },
  { id: 2, day: 'May 15', value: 62 },
  { id: 3, day: 'May 16', value: 58 },
  { id: 4, day: 'May 17', value: 71 },
  { id: 5, day: 'May 18', value: 65 },
  { id: 6, day: 'May 19', value: 52 },
  { id: 7, day: 'May 20', value: 48 },
];

export function InsightsPanel() {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-[17px] text-foreground font-display mb-0.5">Insights</h3>
      <p className="text-[12px] text-muted-foreground font-medium mb-5">Supply chain intelligence</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 rounded-lg bg-muted/15 border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.1em] font-bold">High Risk Routes</p>
          <h4 className="text-[26px] text-foreground leading-none font-display">3</h4>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/15 border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.1em] font-bold">Repeated Delays</p>
          <h4 className="text-[26px] text-foreground leading-none font-display">8</h4>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/15 border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.1em] font-bold">Avg. Risk Score</p>
          <h4 className="text-[26px] text-foreground leading-none font-display">47</h4>
        </div>
      </div>

      <div>
        <h4 className="text-[13px] text-foreground font-bold mb-3">Risk Over Time</h4>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={trendData}>
            <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, padding: '6px 10px' }} />
            <Bar key="bar-value" dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 p-4 rounded-lg bg-primary/8 border border-primary/15">
        <h4 className="text-[13px] text-foreground font-bold mb-1.5">Key Insight</h4>
        <p className="text-[12px] text-foreground font-medium leading-relaxed">
          Shipments through Bay of Bengal face <span className="font-bold text-[var(--risk-high)]">70% higher risk</span> compared to other regions.
        </p>
      </div>

      <button 
        onClick={() => toast.success('Loading full report data...')}
        className="w-full mt-4 px-4 py-2.5 text-[13px] text-primary font-bold border border-border rounded-lg hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-200"
      >
        View Full Report
      </button>
    </div>
  );
}
