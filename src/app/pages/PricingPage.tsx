// src/app/pages/PricingPage.tsx
// ============================================================
// PRICING / PLAN PAGE — Free / Basic / Pro tiers
// ============================================================

import { useState } from 'react';
import { useDashboard } from '../DashboardContext';
import { updatePlan } from '../../services/authService';
import { Check, Crown, Zap, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'Get started at no cost',
    icon: Package,
    color: '#5C6B4A',
    features: [
      'Up to 10 active shipments',
      'Basic risk monitoring',
      'Alerts & notifications',
      'Standard reporting',
      '7-day data retention',
    ],
    limited: ['No simulations', 'No route analysis', 'No snapshots'],
  },
  {
    id: 'basic' as const,
    name: 'Basic',
    price: '$49',
    period: 'per month',
    tagline: 'For growing operations',
    icon: Zap,
    color: '#3D5A1E',
    popular: true,
    features: [
      'Up to 50 active shipments',
      'Advanced risk scoring',
      'Simulation engine (congestion, delay)',
      'Route alternatives analysis',
      'Snapshot & comparison tools',
      '30-day data retention',
      'Email support',
    ],
    limited: ['No stress-test simulations'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$149',
    period: 'per month',
    tagline: 'Full enterprise control',
    icon: Crown,
    color: '#C78C1E',
    features: [
      'Unlimited shipments',
      'Full simulation suite (storm, stress-test)',
      'Cascading risk analysis',
      'Priority alert routing',
      'Advanced tradeoff explorer',
      'Custom snapshot policies',
      '365-day data retention',
      'Priority support + SLA',
    ],
  },
];

export default function PricingPage() {
  const { userId } = useDashboard();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  // Read current plan from profile (optimistic: default free)
  async function handleUpgrade(planId: 'free' | 'basic' | 'pro') {
    if (!userId) return;
    setUpgrading(planId);
    const { error } = await updatePlan(userId, planId);
    setUpgrading(null);
    if (error) {
      toast.error('Failed to update plan: ' + error);
    } else {
      toast.success(`Switched to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[26px] text-foreground font-display mb-2">Plans & Pricing</h1>
        <p className="text-[13px] text-muted-foreground">
          Choose the right plan for your supply chain operations.
          Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isUpgrading = upgrading === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-card rounded-xl border shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md ${
                plan.popular ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-6 flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${plan.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3 className="text-[16px] text-foreground font-display">{plan.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5 pb-5 border-b border-border">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] text-foreground font-display">{plan.price}</span>
                    <span className="text-[12px] text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-4">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-[12px] text-foreground leading-relaxed">{f}</span>
                    </div>
                  ))}
                  {plan.limited?.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <span className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-center text-[10px] leading-none">✕</span>
                      <span className="text-[12px] text-muted-foreground leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!upgrading}
                  className="w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background: plan.popular ? plan.color : 'transparent',
                    color: plan.popular ? '#FAF8EE' : plan.color,
                    border: `1.5px solid ${plan.color}`,
                  }}
                >
                  {isUpgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {plan.id === 'free' ? 'Use Free Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-[16px] font-display text-foreground mb-5">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Feature</th>
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">Free</th>
                <th className="text-center py-2 px-4 text-primary font-semibold">Basic</th>
                <th className="text-center py-2 px-4 text-[#C78C1E] font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                ['Active Shipments', '10', '50', 'Unlimited'],
                ['Risk Monitoring', '✓', '✓', '✓'],
                ['Alerts & Notifications', '✓', '✓', '✓'],
                ['Simulations', '✗', '✓', '✓'],
                ['Stress-Test (Storm)', '✗', '✗', '✓'],
                ['Route Analysis', '✗', '✓', '✓'],
                ['Snapshot Comparison', '✗', '✓', '✓'],
                ['Data Retention', '7 days', '30 days', '365 days'],
                ['Support', 'Community', 'Email', 'Priority SLA'],
              ].map(([feature, free, basic, pro]) => (
                <tr key={feature} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 pr-4 text-foreground">{feature}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{free}</td>
                  <td className="py-3 px-4 text-center text-primary font-medium">{basic}</td>
                  <td className="py-3 px-4 text-center font-medium" style={{ color: '#C78C1E' }}>{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
