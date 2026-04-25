// src/app/pages/LoginPage.tsx
// ============================================================
// LOGIN PAGE — email/password auth via Supabase
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { loginUser, signupUser } from '../../services/authService';
import { Package, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fn = mode === 'login' ? loginUser : signupUser;
    const { error: err } = await fn(email, password);

    setLoading(false);

    if (err) {
      setError(err);
    } else {
      navigate('/');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECE6CE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background decorative circles */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(61,90,30,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,207,120,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: '#FAF8EE',
        borderRadius: '16px',
        border: '1px solid rgba(61,90,30,0.15)',
        boxShadow: '0 8px 40px rgba(61,90,30,0.12)',
        padding: '40px 36px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '44px', height: '44px',
            background: '#3D5A1E',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={22} color="#FAF8EE" strokeWidth={1.8} />
          </div>
          <div>
            <h2 style={{
              fontFamily: "'DM Serif Display', 'Playfair Display', serif",
              fontSize: '18px', fontWeight: 400,
              color: '#1A2412', margin: 0, lineHeight: 1.2,
            }}>
              SupplyChain
            </h2>
            <p style={{ fontSize: '11px', color: '#5C6B4A', margin: 0, lineHeight: 1 }}>
              Control Tower
            </p>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'DM Serif Display', 'Playfair Display', serif",
          fontSize: '26px', fontWeight: 400,
          color: '#1A2412', margin: '0 0 6px 0',
        }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: '13px', color: '#5C6B4A', margin: '0 0 28px 0' }}>
          {mode === 'login'
            ? 'Sign in to your control tower'
            : 'Start managing your supply chain'}
        </p>

        {/* Mode toggle pills */}
        <div style={{
          display: 'flex', gap: '4px',
          background: '#DDD8BC', borderRadius: '8px', padding: '3px',
          marginBottom: '24px',
        }}>
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              style={{
                flex: 1, padding: '7px 0',
                borderRadius: '6px', border: 'none',
                fontSize: '13px', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === m ? '#3D5A1E' : 'transparent',
                color: mode === m ? '#FAF8EE' : '#5C6B4A',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Email */}
          <div>
            <label style={{
              display: 'block', fontSize: '12px',
              fontWeight: 600, color: '#3A4A2E',
              marginBottom: '5px', textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%', padding: '10px 14px',
                background: '#F3F0E0',
                border: '1px solid rgba(61,90,30,0.2)',
                borderRadius: '8px',
                fontSize: '14px', color: '#1A2412',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3D5A1E')}
              onBlur={e => (e.target.style.borderColor = 'rgba(61,90,30,0.2)')}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block', fontSize: '12px',
              fontWeight: 600, color: '#3A4A2E',
              marginBottom: '5px', textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: '100%', padding: '10px 14px',
                background: '#F3F0E0',
                border: '1px solid rgba(61,90,30,0.2)',
                borderRadius: '8px',
                fontSize: '14px', color: '#1A2412',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3D5A1E')}
              onBlur={e => (e.target.style.borderColor = 'rgba(61,90,30,0.2)')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(168,73,58,0.08)',
              border: '1px solid rgba(168,73,58,0.25)',
              borderRadius: '8px', padding: '10px 12px',
            }}>
              <AlertCircle size={15} color="#A8493A" />
              <span style={{ fontSize: '13px', color: '#A8493A' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              width: '100%', padding: '12px',
              background: loading ? '#6B8E4E' : '#3D5A1E',
              color: '#FAF8EE',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#2D4416'); }}
            onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = '#3D5A1E'); }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Footer note */}
        <p style={{
          marginTop: '24px', fontSize: '11px',
          color: '#8A9B7A', textAlign: 'center', lineHeight: 1.5,
        }}>
          Supply Chain Control Tower · Secure access
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
