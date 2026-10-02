import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Eye, EyeOff, ShieldCheck, ArrowLeft, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { renderGoogleSignInButton, GoogleUserProfile } from '../../services/googleAuth';

declare global {
  interface Window {
    google?: any;
  }
}

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
    handleGoogleLogin,
    addToast,
    isAdminUrl,
    navigateToStorefront
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [adminTab, setAdminTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  useEffect(() => {
    let isMounted = true;
    if (authModalOpen && !isAdminUrl) {
      const timer = setTimeout(() => {
        if (googleBtnRef.current && isMounted) {
          renderGoogleSignInButton(
            googleBtnRef.current,
            async (profile: GoogleUserProfile) => {
              if (!isMounted) return;
              setGoogleLoading(true);
              setErrorMsg('');
              try {
                await handleGoogleLogin({
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                  credential: profile.credential
                });
                handleClose();
                addToast('success', `Signed in as ${profile.name}`);
              } catch (err: any) {
                setErrorMsg(err.message || 'Google Sign-In failed');
              } finally {
                if (isMounted) setGoogleLoading(false);
              }
            },
            (err) => {
              console.warn('Google Sign-In initialization:', err);
            }
          );
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
    return () => {
      isMounted = false;
    };
  }, [authModalOpen, isAdminUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isAdminUrl) {
      if (adminTab === 'register' && password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
    } else {
      if (authModalTab === 'register' && password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      let res;
      if (isAdminUrl) {
        if (adminTab === 'register') {
          res = await api.registerAdmin(name, email, password);
        } else {
          res = await api.login(email, password);
          if (res.user.role !== 'admin') {
            localStorage.removeItem('sefali_token');
            setErrorMsg('Access denied. This portal is for studio administrators only.');
            setLoading(false);
            return;
          }
        }
      } else {
        if (authModalTab === 'login') {
          res = await api.login(email, password);
          if (res.user.role === 'admin') {
            localStorage.removeItem('sefali_token');
            setErrorMsg('This is an administrator account. Please log in via the designated Admin Portal (/.admin).');
            setLoading(false);
            return;
          }
        } else {
          res = await api.register(name, email, password);
        }
      }

      localStorage.setItem('sefali_token', res.token);
      setUser(res.user);

      if (res.user.role === 'admin' && isAdminUrl) {
        setActiveMode('admin');
        setActiveTab('catalog');
        await refreshAdminStats();
      } else {
        setActiveMode('customer');
        setActiveTab('storefront');
      }

      handleClose();
      const isRegister = (isAdminUrl && adminTab === 'register') || (!isAdminUrl && authModalTab === 'register');
      addToast(
        'success',
        isRegister
          ? `Welcome to THE SHEFALIS SPACE, ${res.user.name}!`
          : `Welcome back, ${res.user.name}!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Secret Admin Portal Modal (Only shown when URL has .admin) ───────────
  if (isAdminUrl) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div
          className="modal-content card-3d animate-pop-in"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '440px', padding: 0, overflow: 'hidden', backgroundColor: '#FAF7EE', borderRadius: '16px' }}
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
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#F6E58D',
                color: '#1C1917',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  THE SHEFALIS SPACE
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
                color: '#A8A29E',
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
          <div style={{ padding: '1.75rem' }}>

            {/* Admin Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#EAE6D8',
              borderRadius: '8px',
              padding: '3px',
              marginBottom: '1.25rem'
            }}>
              <button
                onClick={() => { setAdminTab('login'); setErrorMsg(''); }}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: '6px', border: 'none',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: adminTab === 'login' ? '#FFFFFF' : 'transparent',
                  color: adminTab === 'login' ? '#1C1917' : '#57534E',
                  boxShadow: adminTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAdminTab('register'); setErrorMsg(''); }}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: '6px', border: 'none',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: adminTab === 'register' ? '#FFFFFF' : 'transparent',
                  color: adminTab === 'register' ? '#1C1917' : '#57534E',
                  boxShadow: adminTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Register
              </button>
            </div>

            {/* Notice */}
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              color: '#92400E',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>Restricted administrative portal for studio management.</span>
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                marginBottom: '1.25rem'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {adminTab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text" className="form-input" placeholder="Studio Administrator"
                    value={name} onChange={(e) => setName(e.target.value)} required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Administrator Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@theshefalisspace.com"
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

              {adminTab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password" className="form-input" placeholder="••••••••"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    required minLength={6}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-3d"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.9rem',
                  marginTop: '0.75rem',
                  backgroundColor: '#1C1917',
                  color: '#FAF7EE',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShieldCheck size={16} />
                {loading
                  ? 'Authenticating...'
                  : (adminTab === 'register' ? 'Create Admin Account' : 'Sign In as Administrator')}
              </button>
            </form>

            <button
              onClick={() => {
                navigateToStorefront();
                handleClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#78716C',
                fontSize: '0.8rem',
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <ArrowLeft size={13} />
              Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Customer Auth Modal with Google OpenID ──────────────────────────────
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content card-3d animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', padding: 0, backgroundColor: '#FAF7EE', borderRadius: '18px', overflow: 'hidden' }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.35rem 2rem',
          backgroundColor: '#F6E58D',
          borderBottom: '1px solid #E6CE60'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4A3E1B', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              THE SHEFALIS SPACE · STUDIO ACCESS
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              {authModalTab === 'login' ? 'Welcome to Our Studio' : 'Create Collector Account'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1C1917',
              padding: '0.4rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.4)',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem 2rem' }}>

          {/* ── GOOGLE SIGN IN OFFICIAL BUTTON ── */}
          <div style={{ width: '100%', marginBottom: '1.25rem' }}>
            {googleLoading && (
              <div style={{
                padding: '0.8rem',
                borderRadius: '8px',
                backgroundColor: '#FAF7EE',
                border: '1px solid #E7E3D4',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#57534E',
                marginBottom: '0.5rem'
              }}>
                Signing in with Google...
              </div>
            )}
            <div
              ref={googleBtnRef}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '44px'
              }}
            />
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '1.25rem 0',
            color: '#78716C',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E7E3D4' }} />
            <span>or email & password</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E7E3D4' }} />
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#EAE6D8',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '1.25rem'
          }}>
            <button
              onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: authModalTab === 'login' ? '#FFFFFF' : 'transparent',
                color: authModalTab === 'login' ? '#1C1917' : '#57534E',
                boxShadow: authModalTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: authModalTab === 'register' ? '#FFFFFF' : 'transparent',
                color: authModalTab === 'register' ? '#1C1917' : '#57534E',
                boxShadow: authModalTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              marginBottom: '1.25rem'
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
                  placeholder="Your Name"
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
                placeholder="your.email@example.com"
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
              disabled={loading}
              className="btn btn-primary btn-3d"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9rem',
                marginTop: '0.75rem',
                borderRadius: '8px'
              }}
            >
              {loading ? 'Authenticating...' : authModalTab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
