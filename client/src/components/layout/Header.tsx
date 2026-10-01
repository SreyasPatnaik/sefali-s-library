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
      <header className="sticky-translucent-header" style={{
        backgroundColor: scrolled ? 'rgba(250, 247, 238, 0.82)' : 'rgba(250, 247, 238, 0.72)',
        borderBottom: '1px solid rgba(234, 229, 212, 0.75)',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: scrolled ? '0 8px 28px rgba(28, 25, 23, 0.07)' : '0 2px 10px rgba(28, 25, 23, 0.02)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          paddingBottom: '1rem',
        }}>

          {/* ── Brand Logo ── */}
          <div
            onClick={() => {
              if (isAdmin) { setActiveTab('catalog'); }
              else { setActiveTab('storefront'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              setMobileMenuOpen(false);
            }}
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', flexShrink: 0 }}
          >
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.92rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
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
                letterSpacing: '0.18em',
                color: '#78716C',
                textTransform: 'uppercase'
              }}>
                DESIGN STUDIO
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

          {/* ── Desktop Nav Links (No admin link in regular customer view) ── */}
          <nav className="hdr-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('catalog')}
                  style={{
                    ...navLinkStyle,
                    fontWeight: activeTab === 'catalog' ? 700 : 500,
                    borderBottom: activeTab === 'catalog' ? '1.5px solid #1C1917' : '1.5px solid transparent'
                  }}
                >
                  <PlusCircle size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  Products Catalog
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{
                    ...navLinkStyle,
                    fontWeight: activeTab === 'dashboard' ? 700 : 500,
                    borderBottom: activeTab === 'dashboard' ? '1.5px solid #1C1917' : '1.5px solid transparent'
                  }}
                >
                  <LayoutDashboard size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    ...navLinkStyle,
                    fontWeight: activeTab === 'orders' ? 700 : 500,
                    borderBottom: activeTab === 'orders' ? '1.5px solid #1C1917' : '1.5px solid transparent'
                  }}
                >
                  <Truck size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  Orders Tracker
                </button>
                <button
                  onClick={navigateToStorefront}
                  style={{
                    ...navLinkStyle,
                    color: '#78716C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ArrowLeft size={13} />
                  View Storefront
                </button>
              </>
            ) : (
              <>
                <button onClick={() => scrollToSection('about')} style={navLinkStyle}>
                  About
                </button>
                <button onClick={() => scrollToSection('collection')} style={navLinkStyle}>
                  Collection
                </button>
                <button onClick={() => scrollToSection('contact')} style={navLinkStyle}>
                  Contact Us
                </button>
                {user && (
                  <button
                    onClick={() => setActiveTab('my-shelf')}
                    style={{
                      ...navLinkStyle,
                      fontWeight: activeTab === 'my-shelf' ? 700 : 500,
                      borderBottom: activeTab === 'my-shelf' ? '1.5px solid #1C1917' : '1.5px solid transparent'
                    }}
                  >
                    <Package size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    My Orders
                  </button>
                )}
              </>
            )}

            {/* Shopping Bag / Cart */}
            {!isAdmin && (
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label="Shopping Bag"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E3D4',
                  borderRadius: '30px',
                  padding: '0.42rem 0.95rem',
                  cursor: 'pointer',
                  color: '#1C1917',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <ShoppingBag size={14} style={{ color: '#1C1917' }} />
                <span>Bag</span>
                {cartItemCount > 0 && (
                  <span style={{
                    backgroundColor: '#1C1917',
                    color: '#F6E58D',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Login / Profile Button */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#F3EEDB',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px'
                }}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#1C1917',
                      color: '#FAF7EE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
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
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#78716C',
                    padding: '0.35rem',
                    display: 'flex',
                    borderRadius: '50%'
                  }}
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
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#1C1917',
                  color: '#FAF7EE',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.48rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
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
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFF',
                  border: '1px solid #E7E3D4',
                  borderRadius: '8px',
                  padding: '0.45rem 0.65rem',
                  cursor: 'pointer',
                }}
              >
                <ShoppingBag size={17} color="#1C1917" />
                {cartItemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#1C1917',
                    color: '#F6E58D',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                background: mobileMenuOpen ? '#F0EDE4' : 'none',
                border: '1px solid transparent',
                borderColor: mobileMenuOpen ? '#E7E3D4' : 'transparent',
                borderRadius: '8px',
                padding: '0.45rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
