import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  Package, Home, Truck, AlertCircle, Zap, Route,
  BarChart3, Camera, Settings, ChevronDown, Lightbulb, Crown, LogOut, DollarSign
} from 'lucide-react';

import { Toaster } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Truck, label: 'Shipments', path: '/shipments' },
  { icon: AlertCircle, label: 'Alerts', path: '/alerts' },
  { icon: Zap, label: 'Simulations', path: '/simulations' },
  { icon: Route, label: 'Routes', path: '/routes' },
  { icon: DollarSign, label: 'Revenue Model', path: '/revenue' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Lightbulb, label: 'Insights',     path: '/insights' },

  { icon: Camera,    label: 'Snapshots',    path: '/snapshots' },
  { icon: Settings,  label: 'Settings',     path: '/settings' },
  { icon: Crown,     label: 'Pricing',      path: '/pricing' },
];

export function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    await logoutUser();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Film grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025] mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}></div>

      <Toaster position="bottom-right" richColors />

      {/* Sidebar — full height from very top */}
      <aside className="w-[230px] bg-[#E5DFCA] border-r border-[rgba(61,90,30,0.15)] min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-30">
        {/* Logo */}
        <div className="px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden">
              <img src="/tree-botanical.jpg" alt="Logo" className="w-10 h-10 object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="text-[15px] text-[#1A2412] font-display font-normal leading-tight tracking-tight">SupplyChain</h2>
              <p className="text-[12px] text-[#5C6B4A] leading-tight">Control Tower</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition-all duration-200 ${
                    isActive
                      ? 'bg-[#3D5A1E] text-[#FAF8EE] font-semibold shadow-md'
                      : 'text-[#3A4A2E] font-medium hover:bg-[rgba(61,90,30,0.08)] hover:text-[#1A2412]'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Botanical tree illustration — user's actual image */}
        <div className="px-3 flex-shrink-0 mb-2">
          <div className="rounded-lg overflow-hidden mx-1">
            <img
              src="/tree-watercolor.jpg"
              alt="Botanical illustration"
              className="w-full h-auto object-cover opacity-75"
              style={{ maxHeight: '220px', objectPosition: 'center bottom' }}
            />
          </div>
        </div>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-[rgba(61,90,30,0.12)]">
          <div className="px-3.5 py-2.5 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#3D5A1E]/15 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] text-[#3D5A1E] font-bold">
                  {user?.email?.slice(0, 2).toUpperCase() ?? 'OT'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#1A2412] font-semibold leading-tight truncate">{user?.email ?? 'Operations Team'}</p>
                <p className="text-[10px] text-[#5C6B4A] leading-tight">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-[#A8493A] font-medium hover:bg-[rgba(168,73,58,0.08)] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 ml-[230px] flex flex-col min-h-screen">
        <main className="flex-1 p-7 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-3.5 px-6 bg-card">
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-[0.3em] font-medium">
            Supply Chain Control Tower  ·  Make Confident Decisions Under Uncertainty
          </p>
        </footer>
      </div>
    </div>
  );
}
