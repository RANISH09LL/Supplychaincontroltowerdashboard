import { TrendingDown, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '../DashboardContext';

export function ActionCard() {
  const { applyRec } = useDashboard();

  const handleLockInAction = async () => {
    const error = await applyRec('A1');
    if (error) {
      toast.error('Action Failed');
    } else {
      toast.success('Action Locked In', {
        description: 'Shipment SH-78291 rerouted via Route B. Risk score reduced to 40.',
      });
    }
  };

  return (
    <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
      <div className="mb-4">
        <div className="inline-flex items-center px-2.5 py-1 bg-[var(--risk-high)]/15 text-[var(--risk-high)] rounded-md text-[11px] font-bold mb-3 tracking-wide">
          High Impact
        </div>
        <h3 className="text-[17px] text-foreground font-display mb-0.5">Recommended Action</h3>
        <p className="text-[16px] text-foreground font-bold">Reroute via Route B</p>
        <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">Shipment SH-78291</p>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <TrendingDown className="w-4 h-4" />
            <span>Risk Score</span>
          </div>
          <span className="text-foreground font-bold"><span className="text-[var(--risk-high)]">85</span> <span className="text-muted-foreground mx-1">→</span> <span className="text-[var(--risk-low)]">40</span></span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Clock className="w-4 h-4" />
            <span>ETA</span>
          </div>
          <span className="text-foreground font-bold">May 24 <span className="text-muted-foreground mx-1">→</span> May 22</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <DollarSign className="w-4 h-4" />
            <span>Cost Impact</span>
          </div>
          <span className="text-foreground font-bold">+ $12,500</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <span>Confidence</span>
          </div>
          <span className="text-foreground font-bold">82% <span className="text-primary hover:underline cursor-pointer ml-1 font-bold">· Why?</span></span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2.5 bg-muted/40 text-foreground rounded-lg text-[13px] font-bold border border-border hover:bg-muted/60 transition-colors">
          View Options
        </button>
        <button 
          onClick={handleLockInAction}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-bold shadow-md hover:bg-primary/85 hover:shadow-lg transition-all duration-200"
        >
          Lock in Action
        </button>
      </div>
    </div>
  );
}
