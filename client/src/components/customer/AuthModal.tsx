import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Eye, EyeOff, ShieldCheck, ArrowLeft, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { signInWithGoogleFirebase } from '../../services/firebase';

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
  const [showGoogleAccountDialog, setShowGoogleAccountDialog] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services if available
  useEffect(() => {
    if (!authModalOpen) return;

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              setGoogleLoading(true);
              handleGoogleLogin({ credential: response.credential })
                .catch((err) => setErrorMsg(err.message))
                .finally(() => setGoogleLoading(false));
            }
          }
        });

        if (googleBtnContainerRef.current) {
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 360
          });
        }
      } catch (err) {
        console.warn('Google Identity initialization notice:', err);
      }
    }
  }, [authModalOpen, handleGoogleLogin]);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setShowGoogleAccountDialog(false);
  };

  const handleGoogleBtnClick = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      // Real OpenID Connect login via Firebase Authentication
      const firebaseRes = await signInWithGoogleFirebase();
      if (firebaseRes?.email) {
        await handleGoogleLogin({
          credential: firebaseRes.idToken,
          email: firebaseRes.email,
          name: firebaseRes.name,
          picture: firebaseRes.picture
        });
        handleClose();
        addToast('success', `Signed in as ${firebaseRes.name} via Google OpenID`);
        return;
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase OpenID login info:', firebaseErr);
      if (firebaseErr?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed.');
      } else {
        setShowGoogleAccountDialog(true);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (selectedEmail: string, selectedName: string, avatarUrl: string) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await handleGoogleLogin({
        email: selectedEmail,
        name: selectedName,
        picture: avatarUrl
      });
      setShowGoogleAccountDialog(false);
      handleClose();
      addToast('success', `Signed in as ${selectedName} via Google OpenID`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OpenID authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }
    const derivedName = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(derivedName)}&background=F6E58D&color=1C1917&bold=true`;
    await handleGoogleAccountSelect(customGoogleEmail.trim(), derivedName, avatar);
  };

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

          {/* ── GOOGLE OPEN ID BUTTON ── */}
          <button
            onClick={handleGoogleBtnClick}
            disabled={googleLoading}
            type="button"
            className="btn-3d"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              backgroundColor: '#FFFFFF',
              color: '#1C1917',
              border: '1px solid #D6D3CA',
              borderRadius: '10px',
              padding: '0.8rem 1rem',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: googleLoading ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
              marginBottom: '1.25rem'
            }}
          >
            {/* Google G Logo SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google Account'}</span>
          </button>

          {/* Google Official Button Container (Rendered by Google Identity Services when Client ID exists) */}
          <div ref={googleBtnContainerRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }} />

          {/* Google Direct Sign-In Dialog */}
          {showGoogleAccountDialog && (
            <div className="card-3d" style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE5D4',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={14} color="#B88E28" /> Sign in with your Google Account
                </span>
                <button
                  type="button"
                  onClick={() => setShowGoogleAccountDialog(false)}
                  style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Direct Google email form */}
              <form onSubmit={handleCustomGoogleSubmit}>
                <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Your Google Account Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Your Name (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your full name"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={googleLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem' }}
                >
                  {googleLoading ? 'Signing In...' : 'Sign In with Google Account'}
                </button>
              </form>
            </div>
          )}

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
