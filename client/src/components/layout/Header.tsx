import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen, User, LogOut, Library, ShoppingBag, ShieldCheck,
  PlusCircle, LayoutDashboard, Truck, X, Menu, Home
} from 'lucide-react';
import { CartDrawer } from '../customer/CartDrawer';

export const Header: React.FC = () => {
  const {
    activeMode, setActiveMode,
    activeTab, setActiveTab,
    user, setAuthModalOpen, setAuthModalTab,
    logout, cart, setIsCartDrawerOpen, addToast
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.role === 'admin';

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

  const navBtnStyle = (tab: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: activeTab === tab ? 700 : 500,
    color: activeTab === tab ? '#2E5A44' : '#57534E',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '2px solid #2E5A44' : '2px solid transparent',
    padding: '0.25rem 0',
    transition: 'color 0.2s ease',
    whiteSpace: 'nowrap',
  });

  const mobileNavBtnStyle = (tab: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    background: activeTab === tab ? '#E8F2EC' : 'transparent',
    border: 'none',
    fontSize: '1.05rem',
    fontWeight: 700,
    color: activeTab === tab ? '#2E5A44' : '#1C1917',
    cursor: 'pointer',
    padding: '0.85rem 2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '300px',
    transition: 'all 0.2s ease',
  });

  return (
    <>
      <header style={{
        backgroundColor: scrolled ? 'rgba(250,247,238,0.97)' : '#FAF7EE',
        borderBottom: '1px solid #E7E3D4',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'box-shadow 0.25s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          paddingBottom: '0.85rem',
        }}>

          {/* ── Logo ── */}
          <div
            onClick={() => {
              if (isAdmin) { setActiveMode('admin'); setActiveTab('catalog'); }
              else { setActiveMode('customer'); setActiveTab('storefront'); }
              setMobileMenuOpen(false);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: isAdmin
                ? 'linear-gradient(135deg, #1C1917 0%, #3D2F28 100%)'
                : 'linear-gradient(135deg, #2E5A44 0%, #4A8C6A 100%)',
              color: '#FAF7EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              flexShrink: 0,
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.01em' }}>
                Sefali's Library
              </span>
              {isAdmin && (
                <span style={{ fontSize: '0.58rem', display: 'block', color: '#78716C', fontWeight: 700, letterSpacing: '0.05em' }}>
                  ADMIN PORTAL
                </span>
              )}
            </div>
          </div>

          {/* ── Desktop Nav (hidden on mobile via CSS class) ── */}
          <nav className="hdr-desktop-nav">
            {isAdmin && activeMode === 'admin' ? (
              <>
                <button onClick={() => setActiveTab('catalog')} style={navBtnStyle('catalog')}>
                  <PlusCircle size={14} /> Catalog
                </button>
                <button onClick={() => setActiveTab('dashboard')} style={navBtnStyle('dashboard')}>
                  <LayoutDashboard size={14} /> Dashboard
                </button>
                <button onClick={() => setActiveTab('orders')} style={navBtnStyle('orders')}>
                  <Truck size={14} /> Orders
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('storefront')} style={navBtnStyle('storefront')}>
                  Catalog
                </button>
                {user && (
                  <button onClick={() => setActiveTab('my-shelf')} style={navBtnStyle('my-shelf')}>
                    <Library size={14} />
                    My Shelf{user?.purchasedBooks?.length ? ` (${user.purchasedBooks.length})` : ''}
                  </button>
                )}
              </>
            )}

            {/* Cart */}
            {activeMode === 'customer' && (
              <button
                onClick={() => {
                  if (!user) { setAuthModalTab('login'); setAuthModalOpen(true); addToast('info', 'Sign in to access your cart.'); return; }
                  setIsCartDrawerOpen(true);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  backgroundColor: '#FFF', border: '1px solid #E7E3D4',
                  borderRadius: '8px', padding: '0.38rem 0.7rem',
                  cursor: 'pointer', color: '#1C1917', fontSize: '0.85rem', fontWeight: 600,
                  transition: 'all 0.2s ease', position: 'relative',
                }}
              >
                <ShoppingBag size={15} style={{ color: '#2E5A44' }} />
                Cart
                {cart.length > 0 && (
                  <span style={{
                    backgroundColor: '#2E5A44', color: '#FFF',
                    fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%',
                    width: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cart.length}
                  </span>
                )}
              </button>
            )}

            {/* User area */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  backgroundColor: isAdmin ? '#FEF3C7' : '#E8F2EC',
                  color: isAdmin ? '#92400E' : '#2E5A44',
                  padding: '0.2rem 0.55rem', borderRadius: '6px',
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}>
                  {isAdmin && <ShieldCheck size={11} />}
                  {isAdmin ? 'Admin' : 'Member'}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1917', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <button onClick={logout} title="Logout"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: '0.25rem', display: 'flex' }}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary" onClick={() => setAuthModalOpen(true)}
                style={{ fontSize: '0.82rem', padding: '0.38rem 0.9rem', gap: '0.35rem' }}>
                <User size={14} /> Sign In
              </button>
            )}
          </nav>

          {/* ── Mobile Right Controls (shown on mobile via CSS) ── */}
          <div className="hdr-mobile-controls">
            {/* Mobile cart badge */}
            {activeMode === 'customer' && user && (
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center',
                  backgroundColor: '#FFF', border: '1px solid #E7E3D4',
                  borderRadius: '8px', padding: '0.42rem 0.6rem',
                  cursor: 'pointer',
                }}
              >
                <ShoppingBag size={17} style={{ color: '#2E5A44' }} />
                {cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    backgroundColor: '#2E5A44', color: '#FFF',
                    fontSize: '0.6rem', fontWeight: 700, borderRadius: '50%',
                    width: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cart.length}
                  </span>
                )}
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                background: mobileMenuOpen ? '#F0EDE4' : 'none',
                border: '1px solid transparent',
                borderColor: mobileMenuOpen ? '#E7E3D4' : 'transparent',
                borderRadius: '8px',
                padding: '0.42rem 0.5rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {mobileMenuOpen
                ? <X size={20} color="#1C1917" />
                : <Menu size={20} color="#1C1917" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Full-Screen Overlay Menu ── */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(250,247,238,0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '0.65rem',
          animation: 'fadeIn 0.2s ease forwards',
          padding: '5rem 1.5rem 2rem',
          overflowY: 'auto',
        }}>
          {/* Close */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: '#F0EDE4', border: 'none', borderRadius: '8px',
              padding: '0.5rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} color="#1C1917" />
          </button>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '7px',
              background: 'linear-gradient(135deg, #2E5A44 0%, #4A8C6A 100%)',
              color: '#FAF7EE', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={15} />
            </div>
            <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700 }}>Sefali's Library</span>
          </div>

          {/* Nav items */}
          {isAdmin && activeMode === 'admin' ? (
            <>
              <button onClick={() => setActiveTab('catalog')} style={mobileNavBtnStyle('catalog')}>
                <PlusCircle size={18} /> Catalog &amp; Publishing
              </button>
              <button onClick={() => setActiveTab('dashboard')} style={mobileNavBtnStyle('dashboard')}>
                <LayoutDashboard size={18} /> Executive Dashboard
              </button>
              <button onClick={() => setActiveTab('orders')} style={mobileNavBtnStyle('orders')}>
                <Truck size={18} /> Orders &amp; Tracking
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('storefront')} style={mobileNavBtnStyle('storefront')}>
                <Home size={18} /> Storefront
              </button>
              {user && (
                <button onClick={() => setActiveTab('my-shelf')} style={mobileNavBtnStyle('my-shelf')}>
                  <Library size={18} /> My Shelf
                  {user?.purchasedBooks?.length ? ` (${user.purchasedBooks.length})` : ''}
                </button>
              )}
            </>
          )}

          <div style={{ width: '200px', height: '1px', backgroundColor: '#E7E3D4', margin: '0.5rem 0' }} />

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  backgroundColor: '#E8F2EC', color: '#2E5A44',
                  padding: '0.2rem 0.6rem', borderRadius: '6px',
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {isAdmin ? 'Admin' : 'Member'}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1C1917' }}>{user.name}</span>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  background: 'none', border: '1px solid #E7E3D4',
                  borderRadius: '10px', padding: '0.55rem 1.5rem',
                  cursor: 'pointer', color: '#57534E', fontSize: '0.9rem', fontWeight: 600,
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', width: '100%', maxWidth: '300px' }}>
              <button className="btn btn-green" style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700 }}
                onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true); setMobileMenuOpen(false); }}>
                Create Free Account
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
                onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); setMobileMenuOpen(false); }}>
                <User size={15} /> Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {user?.role !== 'admin' && <CartDrawer />}
    </>
  );
};
