import { useDashboard, ShipmentStatus } from '../DashboardContext';

export function ShipmentsTable() {
  const { shipments, metrics } = useDashboard();
  
  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'bg-[var(--risk-high)] text-white';
    if (risk >= 40) return 'bg-[var(--risk-medium)] text-white';
    return 'bg-[var(--risk-low)] text-white';
  };

  const getStatusColor = (status: string) => {
    if (status === 'at_risk') return 'text-[var(--risk-high)] font-bold';
    if (status === 'delayed') return 'text-[var(--risk-medium)] font-bold';
    return 'text-[var(--risk-low)] font-bold';
  };

  const getStatusNumber = (status: string) => {
     return shipments.filter(s => s.status === status).length;
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-[17px] text-foreground font-display">All Shipments</h3>
        <button className="text-[12px] text-primary font-bold hover:underline transition-colors">View All Shipments</button>
      </div>

      <div className="px-4 py-2.5 border-b border-border flex gap-2 overflow-x-auto bg-muted/10">
        <button className="whitespace-nowrap px-3.5 py-1.5 rounded-md text-[12px] bg-primary text-primary-foreground font-bold shadow-sm">All {metrics?.total_shipments || 0}</button>
        <button className="whitespace-nowrap px-3.5 py-1.5 rounded-md text-[12px] text-foreground font-semibold hover:bg-muted/50 transition-colors">At Risk {getStatusNumber('at_risk')}</button>
        <button className="whitespace-nowrap px-3.5 py-1.5 rounded-md text-[12px] text-foreground font-semibold hover:bg-muted/50 transition-colors">Delayed {getStatusNumber('delayed')}</button>
        <button className="whitespace-nowrap px-3.5 py-1.5 rounded-md text-[12px] text-foreground font-semibold hover:bg-muted/50 transition-colors">On-Time {getStatusNumber('on_time')}</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] text-muted-foreground font-bold uppercase tracking-[0.08em]">Shipment ID</th>
              <th className="px-6 py-3 text-left text-[11px] text-muted-foreground font-bold uppercase tracking-[0.08em]">Origin</th>
              <th className="px-6 py-3 text-left text-[11px] text-muted-foreground font-bold uppercase tracking-[0.08em]">Destination</th>
              <th className="px-6 py-3 text-left text-[11px] text-muted-foreground font-bold uppercase tracking-[0.08em]">ETA</th>
              <th className="px-6 py-3 text-left text-[11px] text-muted-foreground font-bold uppercase tracking-[0.08em]">Risk Score</th>
              <th className="px-6 py-3 text-left text-[11px] text-muted-foreground font-bold uppercase tracking-[0.08em]">Status</th>
              <th className="px-6 py-3 text-left text-[11px] text-muted-foreground font-bold uppercase tracking-[0.08em]">Value</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="border-t border-border/40 hover:bg-muted/10 transition-colors cursor-pointer">
                <td className="px-6 py-3.5 text-[13px] text-foreground font-bold">{shipment.id}</td>
                <td className="px-6 py-3.5 text-[13px] text-foreground font-medium">{shipment.origin}</td>
                <td className="px-6 py-3.5 text-[13px] text-foreground font-medium">{shipment.destination}</td>
                <td className="px-6 py-3.5 text-[13px] text-foreground font-medium">{shipment.eta}</td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex min-w-[34px] justify-center px-2.5 py-1 rounded-full text-[11px] font-black ${getRiskColor(shipment.risk_score)}`}>
                    {Math.round(shipment.risk_score)}
                  </span>
                </td>
                <td className={`px-6 py-3.5 text-[13px] ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </td>
                <td className="px-6 py-3.5 text-[13px] text-foreground font-semibold">${shipment.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
