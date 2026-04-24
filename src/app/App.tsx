import { Routes, Route } from 'react-router';
import { Layout } from './Layout';
import DashboardPage from './pages/DashboardPage';
import ShipmentsPage from './pages/ShipmentsPage';
import AlertsPage from './pages/AlertsPage';
import SimulationsPage from './pages/SimulationsPage';
import RoutesPage from './pages/RoutesPage';
import ReportsPage from './pages/ReportsPage';
import InsightsPage from './pages/InsightsPage';
import SnapshotsPage from './pages/SnapshotsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="simulations" element={<SimulationsPage />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="snapshots" element={<SnapshotsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
