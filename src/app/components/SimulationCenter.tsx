import { toast } from 'sonner';
import { useDashboard } from '../DashboardContext';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

// SVG illustrations for each scenario
const StormIllustration = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 48 }}>
    <ellipse cx="40" cy="30" rx="32" ry="18" fill="#B8C8D8" opacity="0.5" />
    <ellipse cx="28" cy="26" rx="18" ry="12" fill="#9AAFC0" opacity="0.7" />
    <ellipse cx="50" cy="24" rx="20" ry="13" fill="#7A9BB5" opacity="0.6" />
    <path d="M36 34 L30 44 L38 40 L34 52" stroke="#3D5A1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M44 32 L39 41 L46 38 L42 49" stroke="#5C7A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="22" cy="20" r="3" fill="#DDD8BC" opacity="0.8"/>
    <circle cx="58" cy="18" r="2" fill="#DDD8BC" opacity="0.6"/>
  </svg>
);

const CongestionIllustration = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 48 }}>
    <rect x="8" y="38" width="64" height="8" rx="2" fill="#B8C8D8" opacity="0.4"/>
    <rect x="12" y="30" width="24" height="12" rx="3" fill="#7A9BB5" opacity="0.7"/>
    <rect x="16" y="26" width="16" height="6" rx="2" fill="#9AAFC0" opacity="0.8"/>
    <circle cx="18" cy="42" r="3" fill="#3D5A1E" opacity="0.7"/>
    <circle cx="30" cy="42" r="3" fill="#3D5A1E" opacity="0.7"/>
    <rect x="44" y="28" width="22" height="14" rx="3" fill="#5E8BA8" opacity="0.6"/>
    <rect x="48" y="24" width="14" height="6" rx="2" fill="#7AAEC8" opacity="0.7"/>
    <circle cx="50" cy="42" r="3" fill="#3D5A1E" opacity="0.7"/>
    <circle cx="60" cy="42" r="3" fill="#3D5A1E" opacity="0.7"/>
    <path d="M38 34 L42 34" stroke="#C78C1E" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38 30 L42 30" stroke="#C78C1E" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DelayIllustration = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 48 }}>
    <circle cx="40" cy="32" r="20" fill="#E8CF78" opacity="0.25" />
    <circle cx="40" cy="32" r="16" stroke="#C78C1E" strokeWidth="2" fill="none"/>
    <path d="M40 20 L40 32 L50 32" stroke="#C78C1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="40" cy="32" r="2.5" fill="#C78C1E"/>
    <path d="M26 14 L22 10" stroke="#A8493A" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M54 14 L58 10" stroke="#A8493A" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 32 L16 32" stroke="#A8493A" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M64 32 L60 32" stroke="#A8493A" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const DemandIllustration = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 48 }}>
    <rect x="10" y="42" width="12" height="10" rx="2" fill="#5E8BA8" opacity="0.6"/>
    <rect x="26" y="34" width="12" height="18" rx="2" fill="#5E8BA8" opacity="0.7"/>
    <rect x="42" y="24" width="12" height="28" rx="2" fill="#3D5A1E" opacity="0.7"/>
    <rect x="58" y="14" width="12" height="38" rx="2" fill="#3D5A1E" opacity="0.9"/>
    <path d="M14 40 L30 32 L46 22 L62 12" stroke="#C78C1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="62" cy="12" r="3.5" fill="#C78C1E"/>
    <path d="M56 12 L62 12 L62 18" stroke="#C78C1E" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SCENARIOS = [
  {
    id: 'storm',
    type: 'storm' as const,
    label: 'Severe Storm',
    illustration: <StormIllustration />,
    bgColor: 'rgba(94, 139, 168, 0.12)',
    duration: '3 hrs',
    affected: 8,
    riskIncrease: '+40%',
    location: 'Bay of Bengal',
  },
  {
    id: 'congestion',
    type: 'congestion' as const,
    label: 'Port Congestion',
    illustration: <CongestionIllustration />,
    bgColor: 'rgba(199, 140, 30, 0.10)',
    duration: '6 hrs',
    affected: 12,
    riskIncrease: '+25%',
    location: 'Port of LA',
  },
  {
    id: 'delay',
    type: 'delay' as const,
    label: 'Traffic Delay',
    illustration: <DelayIllustration />,
    bgColor: 'rgba(232, 207, 120, 0.18)',
    duration: '2 hrs',
    affected: 5,
    riskIncrease: '+20%',
    location: 'Trans-Saharan Route',
  },
  {
    id: 'demand_spike',
    type: 'demand_spike' as const,
    label: 'Demand Spike',
    illustration: <DemandIllustration />,
    bgColor: 'rgba(61, 90, 30, 0.10)',
    duration: '12 hrs',
    affected: 15,
    riskIncrease: '+35%',
    location: 'Global',
  },
];

export function SimulationCenter() {
  const { runSimulation } = useDashboard();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const activeScenario = SCENARIOS.find(s => s.id === activeId);

  const handleRunSimulation = async (scenario: typeof SCENARIOS[0]) => {
    setRunning(true);
    setActiveId(scenario.id);
    const error = await runSimulation(scenario.type);
    setRunning(false);

    if (error) {
      toast.error('Simulation Failed', { description: error });
    } else {
      toast.success(`${scenario.label} Simulation Active`, {
        description: `Scenario is now running. Risk scores have been updated.`,
      });
    }
  };

  const handleReset = () => {
    setActiveId(null);
    toast.success('Simulation Reset', { description: 'All shipment data returned to baseline.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Scenario Templates */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 12 }}>
          Scenario Templates
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SCENARIOS.map((scenario) => {
            const isActive = activeId === scenario.id;
            return (
              <div
                key={scenario.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  padding: '16px 10px 12px',
                  borderRadius: 12,
                  border: isActive ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: isActive ? 'rgba(61,90,30,0.06)' : 'var(--card)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 12px rgba(61,90,30,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => !running && handleRunSimulation(scenario)}
              >
                {/* Illustration circle */}
                <div style={{
                  width: 72, height: 56,
                  borderRadius: 10,
                  background: isActive ? 'rgba(61,90,30,0.08)' : scenario.bgColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  {scenario.illustration}
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--foreground)', textAlign: 'center', lineHeight: 1.3 }}>
                  {scenario.label}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); if (!running) handleRunSimulation(scenario); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: isActive ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    fontSize: 10, fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isActive && running ? 'Running…' : isActive ? 'Active' : 'Run Simulation'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Simulation Panel */}
      <div style={{
        borderRadius: 12,
        border: '1.5px solid var(--border)',
        background: activeScenario ? 'rgba(61,90,30,0.04)' : 'var(--card)',
        overflow: 'hidden',
        transition: 'background 0.3s',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>
            Active Simulation
          </p>
          {activeScenario && (
            <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted-foreground)', fontSize: 11 }}>
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>

        <div style={{ padding: '16px 18px' }}>
          {activeScenario ? (
            <>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: 'var(--foreground)', marginBottom: 14 }}>
                {activeScenario.label} in {activeScenario.location}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Duration', value: activeScenario.duration },
                  { label: 'Affected Shipments', value: activeScenario.affected },
                  { label: 'Risk Increase', value: activeScenario.riskIncrease, highlight: true },
                ].map(stat => (
                  <div key={stat.label}>
                    <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>{stat.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: stat.highlight ? 'var(--risk-high)' : 'var(--foreground)', lineHeight: 1 }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => toast.success('Opening simulation results…', { description: 'Generating impact analysis report.' })}
                style={{
                  padding: '8px 18px',
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Results
              </button>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', padding: '8px 0' }}>
              Select a scenario above to simulate the impact on your supply chain.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
