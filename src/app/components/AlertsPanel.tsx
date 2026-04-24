import { AlertTriangle, MapPin, Truck, Package } from 'lucide-react';

const alerts = [
  { id: 1, type: 'high', title: 'Severe Weather Warning', description: 'Heavy storms expected in Bay of Bengal', time: '10 min ago', icon: AlertTriangle },
  { id: 2, type: 'medium', title: 'Port Congestion', description: 'High congestion at Los Angeles Port', time: '25 min ago', icon: MapPin },
  { id: 3, type: 'medium', title: 'Route Delay', description: 'Road closure on Route 66', time: '1 hr ago', icon: Truck },
  { id: 4, type: 'low', title: 'Customs Delay', description: 'Documentation verification in progress', time: '2 hr ago', icon: Package },
];

export function AlertsPanel() {
  const getSeverityColor = (type: string) => {
    if (type === 'high') return 'bg-[var(--risk-high)]';
    if (type === 'medium') return 'bg-[var(--risk-medium)]';
    return 'bg-[var(--risk-low)]';
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-[17px] text-foreground font-display">Alerts Panel</h3>
        <button className="text-[12px] text-primary font-bold hover:underline">View All</button>
      </div>
      <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className="px-5 py-4 hover:bg-muted/15 cursor-pointer transition-colors">
            <div className="flex gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getSeverityColor(alert.type)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-[13px] text-foreground font-bold">{alert.title}</h4>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2 font-medium">{alert.time}</span>
                </div>
                <p className="text-[12px] text-muted-foreground font-medium leading-relaxed">{alert.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
