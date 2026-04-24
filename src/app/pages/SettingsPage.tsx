import { User, Globe, Bell, Shield, Palette, Database } from 'lucide-react';

const settingSections = [
  { icon: User, title: 'Profile', desc: 'Manage your account and team information', action: 'Edit Profile' },
  { icon: Bell, title: 'Notifications', desc: 'Configure alert thresholds and delivery channels', action: 'Configure' },
  { icon: Globe, title: 'Integrations', desc: 'Connect ERP, TMS, and external data sources', action: 'Manage' },
  { icon: Shield, title: 'Security', desc: 'Two-factor auth, API keys, and access controls', action: 'Review' },
  { icon: Palette, title: 'Appearance', desc: 'Theme settings, density, and display options', action: 'Customize' },
  { icon: Database, title: 'Data Management', desc: 'Export, backup, and data retention policies', action: 'Manage' },
];

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] text-foreground font-display">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage your workspace configuration</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}
