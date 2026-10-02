import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag, User, LogOut, Package,
  PlusCircle, LayoutDashboard, Truck, X, Menu, ArrowLeft
} from 'lucide-react';
import { CartDrawer } from '../customer/CartDrawer';

export const Header: React.FC = () => {
  const {
    activeMode, setActiveMode,
    activeTab, setActiveTab,
    user, setAuthModalOpen, setAuthModalTab,
    logout, cart, setIsCartDrawerOpen,
    isAdminUrl, navigateToStorefront
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.role === 'admin' && activeMode === 'admin';
  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  useEffect(() => { setMobileMenuOpen(false); }, [activeTab]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activeTab !== 'storefront') {
      setActiveTab('storefront');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinkStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '0.825rem',
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: '#1C1917',
    cursor: 'pointer',
    padding: '0.35rem 0.6rem',
    textTransform: 'uppercase',
    transition: 'color 0.2s ease, opacity 0.2s ease',
    opacity: 0.85,
  };

  return (
    <>
      <header className={`sticky-translucent-header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: scrolled ? '0.75rem' : '1rem',
          paddingBottom: scrolled ? '0.75rem' : '1rem',
          transition: 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>

          {/* ── Brand Logo with Studio Crest ── */}
          <div
            onClick={() => {
              if (isAdmin) { setActiveTab('catalog'); }
              else { setActiveTab('storefront'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              setMobileMenuOpen(false);
            }}
            className="brand-logo-container"
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          >
            <div className="brand-crest-pill" style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2E5A44 0%, #1C382A 100%)',
              color: '#FAF7EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              border: '1px solid rgba(246, 229, 141, 0.4)',
              boxShadow: '0 2px 8px rgba(46, 90, 68, 0.25)',
              flexShrink: 0
            }}>
              S
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand-title-text" style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#1C1917',
                lineHeight: 1.15
              }}>
                THE SHEFALIS SPACE
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1px' }}>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  color: '#8C827A',
                  textTransform: 'uppercase'
                }}>
                  ART & DESIGN STUDIO
                </span>
                {isAdmin && (
                  <span style={{
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    backgroundColor: '#1C1917',
                    color: '#F6E58D',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    letterSpacing: '0.08em'
                  }}>
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Desktop Nav Links (Pill Style) ── */}
          <nav className="hdr-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAdmin ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(28, 25, 23, 0.03)',
                padding: '0.3rem 0.5rem',
                borderRadius: '30px',
                border: '1px solid rgba(234, 229, 212, 0.8)'
              }}>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`nav-pill-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                >
                  <PlusCircle size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
                  Products Catalog
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`nav-pill-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`nav-pill-btn ${activeTab === 'orders' ? 'active' : ''}`}
                >
                  <Truck size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
                  Orders Tracker
                </button>
                <button
                  onClick={navigateToStorefront}
                  className="nav-pill-btn"
                  style={{ color: '#78716C' }}
                >
                  <ArrowLeft size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Storefront
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: 'rgba(28, 25, 23, 0.03)',
                padding: '0.3rem 0.4rem',
                borderRadius: '30px',
                border: '1px solid rgba(234, 229, 212, 0.8)'
              }}>
                <button onClick={() => scrollToSection('about')} className="nav-pill-btn">
                  About
                </button>
                <button onClick={() => scrollToSection('collection')} className="nav-pill-btn">
                  Collection
                </button>
                <button onClick={() => scrollToSection('contact')} className="nav-pill-btn">
                  Contact Us
                </button>
                {user && (
                  <button
                    onClick={() => setActiveTab('my-shelf')}
                    className={`nav-pill-btn ${activeTab === 'my-shelf' ? 'active' : ''}`}
                  >
                    <Package size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    My Orders
                  </button>
                )}
              </div>
            )}

            {/* Shopping Bag / Cart */}
            {!isAdmin && (
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label="Shopping Bag"
                className="hdr-bag-pill"
              >
                <ShoppingBag size={15} />
                <span>Bag</span>
                {cartItemCount > 0 && (
                  <span className="hdr-cart-count">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Login / Profile Button */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
                <div className="hdr-user-pill">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#2E5A44',
                      color: '#FAF7EE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#1C1917',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="hdr-logout-btn"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setAuthModalOpen(true);
                }}
                className="btn-luxury-signin"
              >
                <User size={13} /> Sign In
              </button>
            )}
          </nav>

          {/* ── Mobile Controls ── */}
          <div className="hdr-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: '0.6rem' }}>
            {!isAdmin && (
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label="Shopping Bag"
                className="hdr-mobile-bag-btn"
              >
                <ShoppingBag size={18} color="#1C1917" />
                {cartItemCount > 0 && (
                  <span className="hdr-mobile-badge">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
              className="hdr-mobile-toggle-btn"
            >
              {mobileMenuOpen ? <X size={20} color="#1C1917" /> : <Menu size={20} color="#1C1917" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Overlay Menu ── */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(250,247,238,0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          animation: 'fadeIn 0.2s ease forwards',
          padding: '5rem 1.5rem 2rem',
          overflowY: 'auto',
        }}>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: '#F0EDE4',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={22} color="#1C1917" />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#1C1917',
              display: 'block'
            }}>
              THE SHEFALIS SPACE
            </span>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#78716C', textTransform: 'uppercase' }}>
              DESIGN STUDIO
            </span>
          </div>

          {isAdmin ? (
            <>
              <button
                onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
                style={{ ...navLinkStyle, fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                Products Catalog
              </button>
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                style={{ ...navLinkStyle, fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                Analytics
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
                style={{ ...navLinkStyle, fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                Orders Tracker
              </button>
              <button
                onClick={() => { navigateToStorefront(); setMobileMenuOpen(false); }}
                style={{ ...navLinkStyle, fontSize: '0.9rem', color: '#78716C' }}
              >
                ← View Storefront
              </button>
            </>
          ) : (
            <>
              <button onClick={() => scrollToSection('about')} style={{ ...navLinkStyle, fontSize: '1.1rem' }}>
                About
              </button>
              <button onClick={() => scrollToSection('collection')} style={{ ...navLinkStyle, fontSize: '1.1rem' }}>
                Collection
              </button>
              <button onClick={() => scrollToSection('contact')} style={{ ...navLinkStyle, fontSize: '1.1rem' }}>
                Contact Us
              </button>
              {user && (
                <button
                  onClick={() => { setActiveTab('my-shelf'); setMobileMenuOpen(false); }}
                  style={{ ...navLinkStyle, fontSize: '1.1rem' }}
                >
                  My Orders
                </button>
              )}
            </>
          )}

          <div style={{ width: '180px', height: '1px', backgroundColor: '#E7E3D4', margin: '0.5rem 0' }} />

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1C1917' }}>{user.name}</span>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'none',
                  border: '1px solid #D6D3CA',
                  borderRadius: '6px',
                  padding: '0.5rem 1.25rem',
                  cursor: 'pointer',
                  color: '#57534E',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalTab('login');
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              style={{
                backgroundColor: '#1C1917',
                color: '#FAF7EE',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Sign In with Google / Email
            </button>
          )}
        </div>
      )}

      {user?.role !== 'admin' && <CartDrawer />}
    </>
  );
};
