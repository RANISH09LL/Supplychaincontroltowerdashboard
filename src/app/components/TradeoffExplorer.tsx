export function TradeoffExplorer() {
  const routes = [
    { name: 'Route A (Current)', risk: 85, eta: 'May 24', cost: '$0', confidence: '62%', isBest: false },
    { name: 'Route B', risk: 40, eta: 'May 22', cost: '+ $12,500', confidence: '71%', isBest: true },
    { name: 'Route C', risk: 55, eta: 'May 23', cost: '+ $8,200', confidence: '58%', isBest: false },
  ];

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-[var(--risk-high)]';
    if (risk >= 40) return 'text-[var(--risk-medium)]';
    return 'text-[var(--risk-low)]';
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-[16px] text-foreground mb-1 font-serif">Recommendations</h3>
      <p className="text-[12px] text-muted-foreground mb-5">AI-powered recommendations</p>

      <div className="mb-5">
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider mb-3">Compare Options</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30">
              <th className="px-4 py-3 text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Option</th>
              <th className="px-4 py-3 text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Risk Score</th>
              <th className="px-4 py-3 text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider">ETA</th>
              <th className="px-4 py-3 text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Cost Impact</th>
              <th className="px-4 py-3 text-left text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr
                key={route.name}
                className={`border-t border-border/60 ${route.isBest ? 'bg-primary/5' : 'hover:bg-muted/20'} transition-colors`}
              >
                <td className="px-4 py-3.5 text-[13px] text-foreground font-medium">
                  {route.name}
                </td>
                <td className={`px-4 py-3.5 text-[13px] font-semibold ${getRiskColor(route.risk)}`}>{route.risk}</td>
                <td className="px-4 py-3.5 text-[13px] text-foreground">{route.eta}</td>
                <td className="px-4 py-3.5 text-[13px] text-foreground">{route.cost}</td>
                <td className="px-4 py-3.5 text-[13px] text-foreground">{route.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-end">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium">
          Best Option
          <span className="font-semibold">Route B</span>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-lg bg-muted/20 border border-border/50">
        <p className="text-[13px] text-foreground font-medium mb-2">Why Route B?</p>
        <ul className="space-y-1.5 text-[12px] text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Avoids severe weather zone</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Lower port congestion</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Faster overall transit time</li>
        </ul>
      </div>
    </div>
  );
}
