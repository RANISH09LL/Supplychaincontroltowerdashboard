import { useState } from 'react';
import { User, Globe, Bell, Shield, Palette, Database, Trash2, Zap, Loader2 } from 'lucide-react';
import { useDashboard } from '../DashboardContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const settingSections = [
  { icon: User, title: 'Profile', desc: 'Manage your account and team information', action: 'Edit Profile' },
  { icon: Bell, title: 'Notifications', desc: 'Configure alert thresholds and delivery channels', action: 'Configure' },
  { icon: Globe, title: 'Integrations', desc: 'Connect ERP, TMS, and external data sources', action: 'Manage' },
  { icon: Shield, title: 'Security', desc: 'Two-factor auth, API keys, and access controls', action: 'Review' },
  { icon: Palette, title: 'Appearance', desc: 'Theme settings, density, and display options', action: 'Customize' },
  { icon: Database, title: 'Data Management', desc: 'Export, backup, and data retention policies', action: 'Manage' },
];

export default function SettingsPage() {
  const { userId } = useDashboard();
  const [resetting, setResetting] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  async function handleResetSystem() {
    if (!userId) return;
    if (!confirm('Are you sure you want to reset the entire database? This will delete all live shipments, events, routes, and recommendations.')) return;
    
    setResetting(true);
    // Delete shipments (cascades to events, routes, recommendations, alerts)
    const { error: err1 } = await supabase.from('shipments').delete().eq('user_id', userId);
    const { error: err2 } = await supabase.from('simulations').delete().eq('user_id', userId);
    const { error: err3 } = await supabase.from('snapshots').delete().eq('user_id', userId);
    
    setResetting(false);
    
    if (err1 || err2 || err3) {
      toast.error('Error resetting system.');
    } else {
      toast.success('System reset successfully. All data purged.');
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] text-foreground font-display">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage your workspace configuration</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {settingSections.map((section) => (
          <div key={section.title} className="bg-card rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] text-foreground font-medium mb-1">{section.title}</h3>
                <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{section.desc}</p>
                <button className="px-3 py-1.5 bg-muted/40 border border-border text-foreground rounded-md text-[12px] font-medium hover:bg-muted/60 transition-colors">
                  {section.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo & Control Layer */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-muted/10">
          <h2 className="text-[16px] text-foreground font-display flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--risk-high)]" /> Demo & Control Layer
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">Special tools for demonstration and testing</p>
        </div>
        <div className="p-5 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-[14px] text-foreground font-medium mb-2">Demo Mode</h3>
            <p className="text-[12px] text-muted-foreground mb-4">Toggle demo-specific overlays and behavior.</p>
            <button 
              onClick={() => setDemoMode(!demoMode)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${demoMode ? 'bg-primary text-primary-foreground' : 'bg-muted/40 border border-border text-foreground'}`}
            >
              {demoMode ? 'Demo Mode Active' : 'Enable Demo Mode'}
            </button>
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium mb-2">Hard Reset System</h3>
            <p className="text-[12px] text-muted-foreground mb-4">Purge all database records directly from Supabase, restoring empty state.</p>
            <button 
              onClick={handleResetSystem}
              disabled={resetting}
              className="px-4 py-2 bg-[var(--risk-high)]/10 text-[var(--risk-high)] border border-[var(--risk-high)]/20 rounded-lg text-[13px] font-medium hover:bg-[var(--risk-high)]/20 transition-colors flex items-center gap-2"
            >
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {resetting ? 'Purging Default State...' : 'Reset System to Default State'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
