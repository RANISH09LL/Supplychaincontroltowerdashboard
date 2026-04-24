import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  tintColor?: string;
}

export function MetricCard({ title, value, change, icon: Icon, tintColor = 'bg-primary/8' }: MetricCardProps) {
  return (
    <div className={`${tintColor} rounded-lg p-5 border border-border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.1em]">{title}</p>
        <div className="w-11 h-11 bg-white/70 rounded-lg flex items-center justify-center border border-white/90 shadow-sm group-hover:shadow-md transition-shadow">
          <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
      </div>
      <div className="mb-1.5">
        <h3 className="text-[30px] text-foreground leading-none tracking-tight font-display">{value}</h3>
      </div>
      {change && (
        <p className="text-[11px] text-muted-foreground font-medium">{change}</p>
      )}
    </div>
  );
}
