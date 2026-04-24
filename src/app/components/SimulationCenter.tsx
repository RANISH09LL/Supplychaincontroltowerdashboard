import { Cloud, Car, TrendingUp, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '../DashboardContext';
import { useState } from 'react';

export function SimulationCenter() {
  const { runSimulation } = useDashboard();
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const handleRunSimulation = async (name: string, type: 'storm' | 'congestion' | 'delay' | 'demand_spike') => {
    setActiveSimulation(name);
    const error = await runSimulation(type);
    
    if (error) {
      toast.error(`Simulation Failed`, { description: error });
    } else {
      toast.info(`Simulation Triggered`, {
        description: `Scenario "${name}" is now active. Risk scores updated.`
      });
    }
  };

  const handleReset = () => {
    setActiveSimulation(null);
    toast.success('Simulation Reset', {
      description: 'Shipment data has returned to baseline status.'
    });
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-[17px] text-foreground font-display mb-4">Simulation Center</h3>

      <div className="mb-5">
        <p className="text-[12px] text-muted-foreground mb-3 font-bold uppercase tracking-[0.08em]">Scenario Templates</p>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => handleRunSimulation('Severe Storm', 'storm')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${activeSimulation === 'Severe Storm' ? 'border-primary bg-primary/8 shadow-md' : 'border-border hover:bg-muted/20 hover:shadow-sm'}`}>
            <Cloud className={`w-6 h-6 ${activeSimulation === 'Severe Storm' ? 'text-primary' : 'text-primary/60'}`} />
            <span className="text-[11px] text-foreground font-bold text-center leading-tight">Severe Storm</span>
          </button>
          <button onClick={() => handleRunSimulation('Port Congestion', 'congestion')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${activeSimulation === 'Port Congestion' ? 'border-primary bg-primary/8 shadow-md' : 'border-border hover:bg-muted/20 hover:shadow-sm'}`}>
            <Car className={`w-6 h-6 ${activeSimulation === 'Port Congestion' ? 'text-primary' : 'text-primary/60'}`} />
            <span className="text-[11px] text-foreground font-bold text-center leading-tight">Port Congestion</span>
          </button>
          <button onClick={() => handleRunSimulation('Traffic Delay', 'delay')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${activeSimulation === 'Traffic Delay' ? 'border-primary bg-primary/8 shadow-md' : 'border-border hover:bg-muted/20 hover:shadow-sm'}`}>
            <Car className={`w-6 h-6 ${activeSimulation === 'Traffic Delay' ? 'text-primary' : 'text-primary/60'}`} />
            <span className="text-[11px] text-foreground font-bold text-center leading-tight">Traffic Delay</span>
          </button>
          <button onClick={() => handleRunSimulation('Demand Spike', 'demand_spike')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${activeSimulation === 'Demand Spike' ? 'border-primary bg-primary/8 shadow-md' : 'border-border hover:bg-muted/20 hover:shadow-sm'}`}>
            <TrendingUp className={`w-6 h-6 ${activeSimulation === 'Demand Spike' ? 'text-primary' : 'text-primary/60'}`} />
            <span className="text-[11px] text-foreground font-bold text-center leading-tight">Demand Spike</span>
          </button>
        </div>
      </div>

      <div className={`p-4 rounded-lg border transition-all duration-200 ${activeSimulation ? 'bg-accent/15 border-accent shadow-sm' : 'bg-muted/15 border-border'}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[12px] text-foreground font-bold uppercase tracking-[0.1em]">Active Simulation</h4>
          <button onClick={handleReset} className="p-1.5 hover:bg-white/60 rounded-md transition-colors" title="Reset Simulation">
            <RotateCcw className={`w-4 h-4 ${activeSimulation ? 'text-primary' : 'text-muted-foreground'}`} />
          </button>
        </div>
        <p className="text-[15px] text-foreground font-bold mb-3">{activeSimulation || 'None Active'}</p>
        
        {activeSimulation ? (
          <>
            <div className="grid grid-cols-3 gap-3 text-[12px]">
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Duration</p>
                <p className="text-foreground font-bold">2 hrs</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Affected</p>
                <p className="text-foreground font-bold">12 Shipments</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Risk Impact</p>
                <p className="text-[var(--risk-high)] font-black">+35%</p>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-bold shadow-md hover:bg-primary/85 transition-all">
              View Results
            </button>
          </>
        ) : (
          <p className="text-[12px] text-muted-foreground font-medium">Select a scenario above to simulate the impact on your supply chain.</p>
        )}
      </div>
    </div>
  );
}
