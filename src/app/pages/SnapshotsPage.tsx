import { useDashboard } from '../DashboardContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Eye, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SnapshotsPage() {
  const { userId, takeSnapshot } = useDashboard();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);

  const fetchSnapshots = () => {
    if (!userId) return;
    supabase
      .from('snapshots')
      .select('id, name, created_at, state_json')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSnapshots(data ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchSnapshots(); }, [userId]);

  async function handleTakeSnapshot() {
    setTaking(true);
    const name = `Snapshot — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const err = await takeSnapshot(name);
    setTaking(false);
    if (err) {
      toast.error('Failed: ' + err);
    } else {
      toast.success('Snapshot saved!');
      fetchSnapshots();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] text-foreground font-display">Snapshots</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Saved states of your supply chain for comparison</p>
        </div>
        <button
          onClick={handleTakeSnapshot}
          disabled={taking}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {taking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          {taking ? 'Saving…' : 'Take Snapshot'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : snapshots.length === 0 ? (
        <div className="bg-card rounded-lg p-12 border border-border text-center">
          <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-[14px] text-foreground font-medium mb-1">No snapshots yet</p>
          <p className="text-[12px] text-muted-foreground">Click "Take Snapshot" to save the current state of your supply chain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {snapshots.map((snap) => {
            const state = snap.state_json as any;
            const metrics = state?.metrics;
            const total   = metrics?.total_shipments ?? state?.totalShipments ?? '—';
            const atRisk  = metrics?.at_risk_count   ?? state?.atRisk         ?? '—';
            const onTime  = metrics?.on_time_count != null
              ? `${((metrics.on_time_count / (metrics.total_shipments || 1)) * 100).toFixed(0)}%`
              : state?.onTime ?? '—';

            return (
              <div key={snap.id} className="bg-card rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[15px] text-foreground font-medium mb-1">{snap.name}</h3>
                    <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(snap.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-all">
                    <Eye className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Shipments</p>
                    <p className="text-[16px] font-display text-foreground">{total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">At Risk</p>
                    <p className="text-[16px] font-display text-[var(--risk-high)]">{atRisk}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">On-Time</p>
                    <p className="text-[16px] font-display text-foreground">{onTime}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
