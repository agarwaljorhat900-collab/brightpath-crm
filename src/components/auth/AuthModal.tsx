import React, { useState } from 'react';
import { LogIn, UserPlus, GraduationCap, AlertCircle, X, Shield, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { signInWithPassword, signUpWithPassword, isSupabaseConnected, setDemoRole } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!isSupabaseConnected) {
      setErrorMsg('Supabase is not configured yet. Use the demo role buttons below to explore.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(email.trim(), password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          onClose();
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Full name is required to register');
          setLoading(false);
          return;
        }
        const { error } = await signUpWithPassword(email.trim(), password, fullName.trim());
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created! Please check your email to confirm registration or sign in.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '24px 20px',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                background: '#4f46e5',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GraduationCap size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>BrightPath CRM</h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Staff & Counselor Portal</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>
            {mode === 'signin' ? 'Sign in to access your student leads pipeline' : 'Create a staff counselor account'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? '#2563eb' : '#64748b',
              borderBottom: mode === 'signin' ? '2px solid #2563eb' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#2563eb' : '#64748b',
              borderBottom: mode === 'signup' ? '2px solid #2563eb' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                color: '#b91c1c',
                fontSize: '0.825rem',
                lineHeight: 1.5
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: errorMsg.toLowerCase().includes('email not confirmed') ? '6px' : '0' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.toLowerCase().includes('email not confirmed') && (
                <div style={{ marginTop: '4px', fontSize: '0.78rem', color: '#7f1d1d' }}>
                  Supabase requires email confirmation before signing in. To confirm instantly:
                  <div style={{ background: '#1e293b', color: '#e2e8f0', padding: '6px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.72rem', marginTop: '6px', userSelect: 'all' }}>
                    UPDATE auth.users SET email_confirmed_at = now() WHERE email = '{email.trim() || 'your-email'}';
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#991b1b' }}>
                    Tip: In Supabase Dashboard &rarr; <em>Auth &rarr; Providers &rarr; Email</em>, toggle off <strong>Confirm email</strong> to disable this requirement during development.
                  </div>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '16px',
                color: '#15803d',
                fontSize: '0.8rem'
              }}
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Nair"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="counselor@brightpath.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.9rem',
                justifyContent: 'center',
                marginTop: '6px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : mode === 'signin' ? (
                <>
                  <LogIn size={16} /> <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} /> <span>Create Staff Account</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher if Supabase is offline */}
          {!isSupabaseConnected && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Quick Demo Role Selector (Offline Mode)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setDemoRole('admin');
                    onClose();
                  }}
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoRole('manager');
                    onClose();
                  }}
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoRole('counsellor');
                    onClose();
                  }}
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Counsellor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
