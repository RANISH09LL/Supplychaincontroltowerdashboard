import { SimulationCenter } from '../components/SimulationCenter';
import { useDashboard } from '../DashboardContext';
import { Clock, History, PlayCircle } from 'lucide-react';

const simulationHistory = [
  { id: 1, name: 'Severe Storm — Bay of Bengal', date: 'May 14, 2024', impact: '+35%', shipments: 12 },
  { id: 2, name: 'Port Strike — LA Port', date: 'May 10, 2024', impact: '+28%', shipments: 8 },
  { id: 3, name: 'Demand Surge — Q4', date: 'May 5, 2024', impact: '+15%', shipments: 24 },
];

export default function SimulationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Simulation Center</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Create & run simulations</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <PlayCircle className="w-4 h-4" /> New Simulation
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Simulation Center component */}
        <SimulationCenter />

        {/* Simulation History */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] text-foreground font-display">Simulation History</h3>
            <button className="text-[12px] text-primary font-medium hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {simulationHistory.map((sim) => (
              <div key={sim.id} className="p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[13px] text-foreground font-medium">{sim.name}</p>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">{sim.date}</span>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {sim.shipments} shipments affected
                  </span>
                  <span className="text-[var(--risk-high)] font-medium">{sim.impact} risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
