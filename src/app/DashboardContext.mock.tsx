import React, { createContext, useContext, useState, ReactNode } from 'react';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ShipmentStatus = 'On-Time' | 'Delayed' | 'At Risk';

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  eta: string;
  riskScore: number;
  status: ShipmentStatus;
  value: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  timeAgo: string;
}

interface SummaryMetrics {
  totalShipments: number;
  atRisk: number;
  valueAtRisk: number;
  onTimePercent: number;
}

interface DashboardContextType {
  shipments: Shipment[];
  alerts: Alert[];
  activeSimulation: string | null;
  demoMode: boolean;
  metrics: SummaryMetrics;
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  setActiveSimulation: (sim: string | null) => void;
  setDemoMode: (mode: boolean) => void;
  resolveIssue: (shipmentId: string, alertId?: string) => void;
  generateSampleData: () => void;
}

const DEFAULT_SHIPMENTS: Shipment[] = [
  { id: 'SH-78291', origin: 'Mumbai, IN', destination: 'Rotterdam, NL', eta: 'May 24, 10:00 AM', riskScore: 85, status: 'At Risk', value: 125000 },
  { id: 'SH-78292', origin: 'Shanghai, CN', destination: 'Los Angeles, US', eta: 'May 20, 2:00 PM', riskScore: 40, status: 'Delayed', value: 98500 },
  { id: 'SH-78293', origin: 'Hamburg, DE', destination: 'New York, US', eta: 'May 19, 9:00 AM', riskScore: 20, status: 'On-Time', value: 76300 },
  { id: 'SH-78294', origin: 'Dubai, UAE', destination: 'London, UK', eta: 'May 21, 11:00 AM', riskScore: 60, status: 'At Risk', value: 63800 },
];

const DEFAULT_ALERTS: Alert[] = [
  { id: 'A1', title: 'Severe Weather Warning', description: 'Heavy storms expected in Bay of Bengal', severity: 'High', timeAgo: '10 min ago' },
  { id: 'A2', title: 'Port Congestion', description: 'High congestion at Los Angeles Port', severity: 'Medium', timeAgo: '25 min ago' },
  { id: 'A3', title: 'Route Delay', description: 'Road closure on Route 66', severity: 'Medium', timeAgo: '1 hr ago' },
  { id: 'A4', title: 'Customs Delay', description: 'Documentation verification in progress', severity: 'Low', timeAgo: '2 hr ago' },
];

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(DEFAULT_SHIPMENTS);
  const [alerts, setAlerts] = useState<Alert[]>(DEFAULT_ALERTS);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const totalShipments = 128; // Usually derived, keeping static base for now, scaled slightly
  const atRiskCount = shipments.filter(s => s.status === 'At Risk' || s.riskScore > 50).length;
  const metrics: SummaryMetrics = {
    totalShipments: totalShipments + (shipments.length - 4), // Dynamic adjustment
    atRisk: 21 + atRiskCount,
    valueAtRisk: shipments.filter(s => s.status === 'At Risk').reduce((sum, s) => sum + s.value, 2000000),
    onTimePercent: 82.1 + (shipments.filter(s => s.status === 'On-Time').length * 0.5)
  };

  const resolveIssue = (shipmentId: string, alertId?: string) => {
    setShipments(current => current.map(s => {
      if (s.id === shipmentId) {
        return { ...s, riskScore: Math.floor(Math.random() * 20) + 10, status: 'On-Time', eta: 'May 22, 10:00 AM' };
      }
      return s;
    }));
    if (alertId) {
        setAlerts(current => current.filter(a => a.id !== alertId));
    }
  };

  const generateSampleData = () => {
    setShipments(current => [...current].sort(() => Math.random() - 0.5));
    // Simulate updating external numbers
  };

  return (
    <DashboardContext.Provider value={{
      shipments, alerts, activeSimulation, demoMode, metrics,
      setShipments, setAlerts, setActiveSimulation, setDemoMode,
      resolveIssue, generateSampleData
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
