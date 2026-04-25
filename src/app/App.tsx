import { Routes, Route, Navigate } from 'react-router';
import { Layout } from './Layout';
import { useAuth } from '../hooks/useAuth';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import RevenueModelPage from './pages/RevenueModelPage';
import DashboardPage from './pages/DashboardPage';
import ShipmentsPage from './pages/ShipmentsPage';
import AlertsPage from './pages/AlertsPage';
import SimulationsPage from './pages/SimulationsPage';
import RoutesPage from './pages/RoutesPage';
import ReportsPage from './pages/ReportsPage';
import InsightsPage from './pages/InsightsPage';
import SnapshotsPage from './pages/SnapshotsPage';
import SettingsPage from './pages/SettingsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#ECE6CE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid #3D5A1E',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: '#5C6B4A', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
          Loading…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<DashboardPage />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="simulations" element={<SimulationsPage />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="snapshots" element={<SnapshotsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="revenue" element={<RevenueModelPage />} />
      </Route>
    </Routes>
  );
}
