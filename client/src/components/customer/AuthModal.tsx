import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    setUser,
    setActiveMode,
    setActiveTab,
    refreshAdminStats,
    addToast
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [adminTab, setAdminTab] = useState<'login' | 'register'>('login');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setIsAdminMode(false);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setInviteCode('');
    setAdminTab('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Customer register: check password match
    if (!isAdminMode && authModalTab === 'register' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    // Admin register: check password match
    if (isAdminMode && adminTab === 'register' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isAdminMode) {
        if (adminTab === 'register') {
          res = await api.registerAdmin(name, email, password, inviteCode);
        } else {
          res = await api.login(email, password);
          // Reject non-admin credentials in admin portal
          if (res.user.role !== 'admin') {
            localStorage.removeItem('sefali_token');
            setErrorMsg('Access denied. This portal is for administrators only.');
            setLoading(false);
            return;
          }
        }
      } else {
        if (authModalTab === 'login') {
          res = await api.login(email, password);
        } else {
          res = await api.register(name, email, password);
        }
      }

      localStorage.setItem('sefali_token', res.token);
      setUser(res.user);

      if (res.user.role === 'admin') {
        setActiveMode('admin');
        setActiveTab('catalog');
        await refreshAdminStats();
      } else {
        setActiveMode('customer');
        setActiveTab('storefront');
      }

      handleClose();
      const isRegister = (isAdminMode && adminTab === 'register') || (!isAdminMode && authModalTab === 'register');
      addToast(
        'success',
        isRegister
          ? `Admin account created! Welcome, ${res.user.name}!`
          : `Welcome back, ${res.user.name}!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const switchToAdminMode = () => {
    setIsAdminMode(true);
    setAdminTab('login');
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setInviteCode('');
  };

  const switchToCustomerMode = () => {
    setIsAdminMode(false);
    setErrorMsg('');
    setEmail('');
    setPassword('');
  };

  // ── Admin Portal UI (Login / Register) ───────────────────────────────────
  if (isAdminMode) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div
          className="modal-content animate-pop-in"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '440px', padding: 0, overflow: 'hidden' }}
        >
          {/* Admin Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            backgroundColor: '#1C1917',
            borderBottom: '1px solid #292524'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#2E5A44',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={18} color="#FAF7EE" />
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#78716C', letterSpacing: '0.1em' }}>
                  RESTRICTED ACCESS
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FAF7EE', margin: 0 }}>
                  {adminTab === 'login' ? 'Admin Portal Sign In' : 'Register Admin Account'}
                </h3>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#78716C',
                padding: '0.4rem',
                borderRadius: '50%',
                backgroundColor: '#292524',
                display: 'flex'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Admin Form Body */}
          <div style={{ padding: '1.75rem', backgroundColor: '#FAF7EE' }}>

            {/* Admin Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#EAE6D8',
              borderRadius: '10px',
              padding: '3px',
              marginBottom: '1.25rem'
            }}>
              <button
                onClick={() => { setAdminTab('login'); setErrorMsg(''); }}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: adminTab === 'login' ? '#FFFFFF' : 'transparent',
                  color: adminTab === 'login' ? '#1C1917' : '#57534E',
                  boxShadow: adminTab === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAdminTab('register'); setErrorMsg(''); }}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: adminTab === 'register' ? '#FFFFFF' : 'transparent',
                  color: adminTab === 'register' ? '#1C1917' : '#57534E',
                  boxShadow: adminTab === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Register
              </button>
            </div>

            {/* Info notice */}
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              color: '#92400E',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              {adminTab === 'login'
                ? 'This portal is for authorised administrators only. Unauthorised access attempts are logged.'
                : 'Admin registration requires a valid invite code issued by your system administrator.'}
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
                fontWeight: 500
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {adminTab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text" className="form-input" placeholder="Administrator full name"
                    value={name} onChange={(e) => setName(e.target.value)} required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Administrator Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@yourorganisation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#78716C',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {adminTab === 'register' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password" className="form-input" placeholder="••••••••"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      required minLength={6} autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Invite Code</label>
                    <input
                      type="password" className="form-input" placeholder="Enter invite code"
                      value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  marginTop: '0.75rem',
                  backgroundColor: loading ? '#57534E' : '#1C1917',
                  color: '#FAF7EE',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background-color 0.2s'
                }}
              >
                <ShieldCheck size={16} />
                {loading
                  ? (adminTab === 'register' ? 'Creating admin account...' : 'Verifying credentials...')
                  : (adminTab === 'register' ? 'Create Admin Account' : 'Sign In to Admin Portal')}
              </button>
            </form>

            <button
              onClick={switchToCustomerMode}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#78716C',
                fontSize: '0.8rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <ArrowLeft size={13} />
              Back to Customer Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Customer Auth UI (Login / Register) ───────────────────────────────────
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: 0 }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          backgroundColor: '#FAF7EE',
          borderBottom: '1px solid #E7E3D4'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2E5A44', letterSpacing: '0.08em' }}>
              ACCOUNT PORTAL
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              {authModalTab === 'login' ? 'Sign In to Your Account' : 'Register New Account'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#78716C',
              padding: '0.4rem',
              borderRadius: '50%',
              backgroundColor: '#EAE6D8',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.75rem' }}>

          {/* Auth Mode Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#EAE6D8',
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: authModalTab === 'login' ? '#FFFFFF' : 'transparent',
                color: authModalTab === 'login' ? '#1C1917' : '#57534E',
                boxShadow: authModalTab === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: authModalTab === 'register' ? '#FFFFFF' : 'transparent',
                color: authModalTab === 'register' ? '#1C1917' : '#57534E',
                boxShadow: authModalTab === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Register
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {authModalTab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#78716C',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authModalTab === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-green"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.75rem' }}
            >
              {loading ? 'Authenticating...' : authModalTab === 'login' ? 'Sign In to Account' : 'Create Account'}
            </button>
          </form>

          {authModalTab === 'register' && (
            <p style={{ fontSize: '0.775rem', color: '#78716C', marginTop: '1rem', textAlign: 'center' }}>
              By creating an account, you agree to our terms of service.
            </p>
          )}

          {/* Admin Portal Link — subtle, login tab only */}
          {authModalTab === 'login' && (
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #E7E3D4',
              textAlign: 'center'
            }}>
              <button
                onClick={switchToAdminMode}
                style={{
                  background: 'none',
                  border: '1px solid #D6D3CA',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  color: '#57534E',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'border-color 0.2s, color 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#1C1917';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#1C1917';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#57534E';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#D6D3CA';
                }}
              >
                <ShieldCheck size={13} />
                Admin Portal Sign In
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
