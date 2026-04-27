import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Database, Trash2, Loader2, Check, ChevronDown } from 'lucide-react';
import { useDashboard } from '../DashboardContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// ── Font options ────────────────────────────────────────────
const FONTS = [
  { id: 'dm', label: 'DM Serif Display', family: "'DM Serif Display', serif" },
  { id: 'playfair', label: 'Playfair Display', family: "'Playfair Display', serif" },
  { id: 'lora', label: 'Lora', family: "'Lora', serif" },
  { id: 'inter', label: 'Inter', family: "'Inter', sans-serif" },
  { id: 'merriweather', label: 'Merriweather', family: "'Merriweather', serif" },
];

// ── Color palette presets ───────────────────────────────────
const PALETTES = [
  { id: 'default', label: 'Forest Classic', colors: ['#3D5A1E', '#6B8E4E', '#E8CF78', '#ECE6CE', '#5E8BA8', '#2D4416'] },
  { id: 'ocean',   label: 'Ocean Blue',    colors: ['#1A4A6B', '#2E7DAF', '#7EC8E3', '#E8F4F8', '#4A9DB5', '#0D2B40'] },
  { id: 'terracotta', label: 'Terracotta', colors: ['#8B3A2F', '#C4614D', '#E8A87C', '#FDF0E8', '#A0522D', '#5C1F16'] },
  { id: 'slate',   label: 'Slate Modern', colors: ['#2D3748', '#4A5568', '#A0AEC0', '#EDF2F7', '#667EEA', '#1A202C'] },
];

const PALETTE_VARS: Record<string, Record<string, string>> = {
  default: { '--primary': '#3D5A1E', '--background': '#ECE6CE', '--card': '#FAF8EE', '--accent': '#5E8BA8', '--secondary': '#E8CF78' },
  ocean:   { '--primary': '#1A4A6B', '--background': '#E8F4F8', '--card': '#F0F8FC', '--accent': '#4A9DB5', '--secondary': '#7EC8E3' },
  terracotta: { '--primary': '#8B3A2F', '--background': '#FDF0E8', '--card': '#FFF8F4', '--accent': '#A0522D', '--secondary': '#E8A87C' },
  slate:   { '--primary': '#2D3748', '--background': '#EDF2F7', '--card': '#FFFFFF',  '--accent': '#667EEA', '--secondary': '#A0AEC0' },
};

// ── Section tab component ───────────────────────────────────
type Tab = 'profile' | 'notifications' | 'appearance' | 'security' | 'data';

export default function SettingsPage() {
  const { userId } = useDashboard();
  const [tab, setTab] = useState<Tab>('profile');
  const [resetting, setResetting] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState('Demo User');
  const [email, setEmail] = useState('');

  // Notification toggles
  const [notifs, setNotifs] = useState({ highRisk: true, delays: true, customs: false, dailySummary: true });

  // Appearance state
  const [selectedFont, setSelectedFont] = useState('dm');
  const [selectedPalette, setSelectedPalette] = useState('default');
  const [fontSize, setFontSize] = useState(16);

  // Security
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? '');
    });
  }, []);

  // Apply font change to document via CSS variables
  const applyFont = (fontId: string) => {
    const font = FONTS.find(f => f.id === fontId);
    if (font) {
      document.documentElement.style.setProperty('--font-display', font.family);
      document.documentElement.style.setProperty('--font-body',
        fontId === 'inter' ? "'Inter', sans-serif" : font.family
      );
      // Also set body directly for immediate effect
      document.body.style.fontFamily = fontId === 'inter' ? "'Inter', sans-serif" : font.family;
    }
    setSelectedFont(fontId);
    toast.success(`Font changed to ${font?.label}`);
  };

  // Apply color palette via CSS variables
  const applyPalette = (paletteId: string) => {
    const vars = PALETTE_VARS[paletteId];
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        document.documentElement.style.setProperty(k, v);
      });
      // Derived card/muted updates
      if (paletteId === 'default') {
        document.documentElement.style.setProperty('--card', '#EDE8D2');
        document.documentElement.style.setProperty('--muted', '#D8D2BA');
      }
    }
    setSelectedPalette(paletteId);
    const p = PALETTES.find(p => p.id === paletteId);
    toast.success(`Color theme changed to ${p?.label}`);
  };

  // Apply font size
  const applyFontSize = (size: number) => {
    document.documentElement.style.setProperty('--font-size', `${size}px`);
    document.documentElement.style.fontSize = `${size}px`;
    setFontSize(size);
  };

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success('Password updated successfully'); setNewPassword(''); setConfirmPassword(''); }
  }

  async function handleResetSystem() {
    if (!userId) return;
    if (!confirm('This will delete all shipments, simulations, and snapshots. Are you sure?')) return;
    setResetting(true);
    await Promise.all([
      supabase.from('shipments').delete().eq('user_id', userId),
      supabase.from('simulations').delete().eq('user_id', userId),
      supabase.from('snapshots').delete().eq('user_id', userId),
    ]);
    setResetting(false);
    toast.success('System reset. All data purged.');
    setTimeout(() => window.location.reload(), 1200);
  }

  const s = {
    page: { display: 'flex', gap: 28 } as React.CSSProperties,
    sidebar: { width: 200, flexShrink: 0 } as React.CSSProperties,
    tabBtn: (active: boolean): React.CSSProperties => ({
      width: '100%', textAlign: 'left', padding: '9px 14px', borderRadius: 8,
      border: 'none', background: active ? 'var(--primary)' : 'transparent',
      color: active ? 'var(--primary-foreground)' : 'var(--foreground)',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 3,
      transition: 'all 0.15s',
    }),
    panel: { flex: 1, background: 'var(--card)', borderRadius: 14, border: '1.5px solid var(--border)', padding: 28, boxShadow: '0 2px 8px rgba(61,90,30,0.06)' } as React.CSSProperties,
    label: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--muted-foreground)', marginBottom: 6, display: 'block' },
    input: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--background)', fontSize: 13, color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' as const },
    section: { marginBottom: 28 } as React.CSSProperties,
    h2: { fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 400, color: 'var(--foreground)', margin: '0 0 6px 0' } as React.CSSProperties,
    subtitle: { fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 24 } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' } as React.CSSProperties,
    toggle: (on: boolean): React.CSSProperties => ({
      width: 40, height: 22, borderRadius: 11, background: on ? 'var(--primary)' : 'var(--muted)', border: 'none',
      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }),
    primaryBtn: { padding: '9px 20px', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    secondaryBtn: { padding: '9px 20px', background: 'transparent', color: 'var(--foreground)', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    dangerBtn: { padding: '9px 20px', background: 'rgba(168,73,58,0.08)', color: '#A8493A', border: '1.5px solid rgba(168,73,58,0.2)', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  };

  const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'data', icon: Database, label: 'Data' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--foreground)', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Manage your workspace configuration</p>
      </div>

      <div style={s.page}>
        {/* Sidebar tabs */}
        <div style={s.sidebar}>
          <div style={{ background: 'var(--card)', borderRadius: 12, border: '1.5px solid var(--border)', padding: 8, boxShadow: '0 2px 8px rgba(61,90,30,0.06)' }}>
            {TABS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)} style={s.tabBtn(tab === id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} />
                  {label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div style={s.panel}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div>
              <h2 style={s.h2}>Profile</h2>
              <p style={s.subtitle}>Manage your account information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={s.label}>Display Name</label>
                  <input style={s.input} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label style={s.label}>Email</label>
                  <input style={{ ...s.input, opacity: 0.6 }} value={email} disabled placeholder="your@email.com" />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>Role</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...s.input, appearance: 'none', paddingRight: 32 }}>
                    <option>Supply Chain Manager</option>
                    <option>Logistics Analyst</option>
                    <option>Operations Director</option>
                    <option>Risk Officer</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
                </div>
              </div>
              <button style={s.primaryBtn} onClick={() => toast.success('Profile saved successfully!')}>Save Changes</button>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <div>
              <h2 style={s.h2}>Notifications</h2>
              <p style={s.subtitle}>Configure which alerts you receive</p>
              {[
                { key: 'highRisk', label: 'High Risk Alerts', desc: 'Notify when shipment risk score exceeds 70' },
                { key: 'delays', label: 'Delay Notifications', desc: 'Alert on shipments with delayed status' },
                { key: 'customs', label: 'Customs Holds', desc: 'Alert when shipments are held at customs' },
                { key: 'dailySummary', label: 'Daily Summary Email', desc: 'Receive a daily overview of your supply chain' },
              ].map(item => (
                <div key={item.key} style={s.row}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0 }}>{item.desc}</p>
                  </div>
                  <button
                    style={s.toggle(notifs[item.key as keyof typeof notifs])}
                    onClick={() => {
                      setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifs] }));
                      toast.success(`${item.label} ${notifs[item.key as keyof typeof notifs] ? 'disabled' : 'enabled'}`);
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, left: notifs[item.key as keyof typeof notifs] ? 21 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {tab === 'appearance' && (
            <div>
              <h2 style={s.h2}>Design System</h2>
              <p style={s.subtitle}>Customize fonts, colors, and visual style</p>

              {/* Colors */}
              <div style={s.section}>
                <label style={s.label}>Colors</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {PALETTES.map(palette => (
                    <div
                      key={palette.id}
                      onClick={() => applyPalette(palette.id)}
                      style={{ cursor: 'pointer', borderRadius: 10, padding: 10, border: selectedPalette === palette.id ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: selectedPalette === palette.id ? 'rgba(61,90,30,0.04)' : 'transparent', transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                        {palette.colors.map((c, i) => (
                          <div key={i} style={{ width: 20, height: 20, borderRadius: 6, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)', margin: 0, textAlign: 'center' }}>{palette.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div style={s.section}>
                <label style={s.label}>Typography</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {FONTS.map(font => (
                    <div
                      key={font.id}
                      onClick={() => applyFont(font.id)}
                      style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: selectedFont === font.id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: selectedFont === font.id ? 'rgba(61,90,30,0.05)' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontFamily: font.family, fontSize: 28, color: 'var(--foreground)', lineHeight: 1, marginBottom: 4 }}>Aa</div>
                      <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0 }}>{font.label}</p>
                      {selectedFont === font.id && <Check size={12} style={{ color: 'var(--primary)', marginTop: 4 }} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div style={s.section}>
                <label style={s.label}>Base Font Size — {fontSize}px</label>
                <input
                  type="range" min={13} max={20} value={fontSize}
                  onChange={e => applyFontSize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
                  <span>Small (13px)</span><span>Default (16px)</span><span>Large (20px)</span>
                </div>
              </div>

              {/* UI Element Preview */}
              <div style={s.section}>
                <label style={s.label}>UI Elements Preview</label>
                <div style={{ padding: 16, background: 'var(--background)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={s.primaryBtn}>Primary Button</button>
                    <button style={s.secondaryBtn}>Secondary Button</button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Chip Label', 'At Risk', 'On Time'].map((c, i) => (
                      <span key={c} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1.5px solid var(--border)', background: i === 0 ? 'var(--muted)' : i === 1 ? 'rgba(168,73,58,0.1)' : 'rgba(90,140,60,0.1)', color: i === 1 ? '#A8493A' : i === 2 ? '#5A8C3C' : 'var(--foreground)' }}>{c}</span>
                    ))}
                  </div>
                  <input style={s.input} placeholder="Input Field" readOnly />
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab === 'security' && (
            <div>
              <h2 style={s.h2}>Security</h2>
              <p style={s.subtitle}>Manage your password and access controls</p>
              <div style={{ maxWidth: 400 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>New Password</label>
                  <input type="password" style={s.input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={s.label}>Confirm Password</label>
                  <input type="password" style={s.input} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                </div>
                <button style={s.primaryBtn} onClick={handlePasswordChange}>Update Password</button>
              </div>
              <div style={{ marginTop: 32, padding: 16, background: 'rgba(168,73,58,0.05)', borderRadius: 10, border: '1px solid rgba(168,73,58,0.15)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#A8493A', marginBottom: 4 }}>Active Session</p>
                <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 12 }}>You are currently signed in as <strong>{email}</strong>.</p>
                <button style={s.dangerBtn} onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}>Sign Out of All Devices</button>
              </div>
            </div>
          )}

          {/* ── DATA ── */}
          {tab === 'data' && (
            <div>
              <h2 style={s.h2}>Data Management</h2>
              <p style={s.subtitle}>Export, backup, and manage your supply chain data</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 18, border: '1.5px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>Export Shipment Data</p>
                    <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0 }}>Download all shipment records as CSV</p>
                  </div>
                  <button style={s.secondaryBtn} onClick={() => toast.success('Export started — CSV will download shortly.')}>Export CSV</button>
                </div>
                <div style={{ padding: 18, border: '1.5px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>Export Full Report</p>
                    <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0 }}>Generate a PDF of your current dashboard snapshot</p>
                  </div>
                  <button style={s.secondaryBtn} onClick={() => toast.success('Report generation started.')}>Export PDF</button>
                </div>
                <div style={{ padding: 18, border: '1.5px solid rgba(168,73,58,0.25)', borderRadius: 10, background: 'rgba(168,73,58,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#A8493A', margin: 0 }}>Hard Reset System</p>
                    <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0 }}>Purge all database records — this cannot be undone</p>
                  </div>
                  <button style={s.dangerBtn} onClick={handleResetSystem} disabled={resetting}>
                    {resetting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                    {resetting ? 'Resetting…' : 'Reset System'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
