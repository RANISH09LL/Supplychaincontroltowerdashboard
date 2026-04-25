import { TrendingDown, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '../DashboardContext';

export function ActionCard() {
  const { recommendations, applyRec } = useDashboard();
  const rec = recommendations[0];

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
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 bg-[var(--risk-high)]/10 text-[var(--risk-high)] border border-[var(--risk-high)]/20 rounded-md text-[11px] font-bold tracking-wide">
              High Impact
            </span>
            {rec && rec.confidence > 85 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[var(--risk-low)]/10 text-[var(--risk-low)] border border-[var(--risk-low)]/20 rounded-md text-[11px] font-bold tracking-wide">
                Safe to Fail
              </span>
            )}
          </div>
          <h3 className="text-[17px] text-foreground font-display mb-0.5">Recommended Action</h3>
          <p className="text-[16px] text-foreground font-bold capitalize">
            {rec ? rec.action_type : 'Reroute via Route B'}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">
            {rec ? rec.description : 'Shipment SH-78291'}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <TrendingDown className="w-4 h-4" />
            <span>Risk Score</span>
          </div>
          <span className="text-foreground font-bold">
            <span className="text-[var(--risk-high)]">{rec ? rec.risk_before : 85}</span> 
            <span className="text-muted-foreground mx-1">→</span> 
            <span className="text-[var(--risk-low)]">{rec ? rec.risk_after : 40}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Clock className="w-4 h-4" />
            <span>ETA</span>
          </div>
          <span className="text-foreground font-bold">
            {rec && rec.eta_change < 0 
              ? `${Math.abs(rec.eta_change)} hrs faster` 
              : rec && rec.eta_change > 0 
                ? `+${rec.eta_change} hrs` 
                : 'No change'}
            {!rec && 'May 24 → May 22'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <DollarSign className="w-4 h-4" />
            <span>Cost Impact</span>
          </div>
          <span className="text-foreground font-bold">
            {rec ? (rec.cost_impact > 0 ? `+$${rec.cost_impact.toLocaleString()}` : 'Minimal') : '+ $12,500'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px] relative group">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <span>Confidence</span>
          </div>
          <span className="text-foreground font-bold flex items-center">
            {rec ? rec.confidence : 82}% 
            <span className="text-primary hover:underline cursor-help ml-2 font-bold text-[11px] px-1.5 bg-primary/10 rounded">Why?</span>
          </span>
          {/* Tooltip for Recommendation Explanation */}
          <div className="absolute right-0 bottom-full mb-2 w-48 p-2.5 bg-foreground text-background text-[11px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center leading-relaxed font-medium">
            {rec?.explanation ? (
              <div className="space-y-1.5 text-left">
                <p className="text-primary-foreground/60 uppercase text-[9px] font-black tracking-wider">Why this works</p>
                <p>{rec.explanation}</p>
              </div>
            ) : (
              "High historical success rate for this structural adjustment under current stress conditions."
            )}
            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-foreground rotate-45" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">

        <button 
          onClick={() => toast.info('Calculating alternative routes...')}
          className="flex-1 px-4 py-2.5 bg-muted/40 text-foreground rounded-lg text-[13px] font-bold border border-border hover:bg-muted/60 hover:scale-[1.02] transition-all"
        >
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
