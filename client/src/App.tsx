import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Storefront } from './components/customer/Storefront';
import { BookDetailsModal } from './components/customer/BookDetailsModal';
import { AuthModal } from './components/customer/AuthModal';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { UserShelf } from './components/customer/UserShelf';
import { ExecutiveDashboard } from './components/admin/ExecutiveDashboard';
import { CatalogControl } from './components/admin/CatalogControl';
import { OrderTracking } from './components/admin/OrderTracking';
import { SplashScreen } from './components/common/SplashScreen';

const MainContent: React.FC = () => {
  const { activeMode, setActiveMode, activeTab, user } = useApp();

  // Enforce strict role boundary
  useEffect(() => {
    if (user?.role === 'admin' && activeMode !== 'admin') {
      setActiveMode('admin');
    } else if (activeMode === 'admin' && user?.role !== 'admin') {
      setActiveMode('customer');
    }
  }, [activeMode, user, setActiveMode]);

  const isAdminView = user?.role === 'admin' && activeMode === 'admin';

  return (
    <main style={{ minHeight: 'calc(100vh - 180px)' }}>
      {isAdminView ? (
        <div className="container" style={{ paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          {activeTab === 'dashboard' ? <ExecutiveDashboard /> :
           activeTab === 'orders' ? <OrderTracking /> :
           <CatalogControl />}
        </div>
      ) : (
        activeTab === 'my-shelf' ? (
          <div className="container" style={{ paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            <UserShelf />
          </div>
        ) : (
          <Storefront />
        )
      )}

      {/* Modals for customer interactions */}
      {!isAdminView && (
        <>
          <BookDetailsModal />
          <CheckoutModal />
        </>
      )}
      <AuthModal />
    </main>
  );
};

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <AppProvider>
        <div style={{ backgroundColor: '#FAF7EE', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <MainContent />

        {/* Studio Footer */}
        <footer style={{
          backgroundColor: '#FAF7EE',
          borderTop: '1px solid #EAE5D5',
          padding: '4rem 0 2.5rem 0',
          marginTop: 'auto'
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
            <div>
              <span className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.12em', color: '#1C1917', textTransform: 'uppercase', display: 'block' }}>
                THE SHEFALIS SPACE
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', color: '#8C827A', textTransform: 'uppercase' }}>
                DESIGN STUDIO
              </span>
            </div>

            <p className="font-serif" style={{ fontSize: '1.05rem', fontStyle: 'italic', color: '#57534E', maxWidth: '460px', margin: 0 }}>
              "Made with soul. With Passion and Meditation."
            </p>

            <div style={{ width: '40px', height: '1px', backgroundColor: '#D6D0C2', margin: '0.5rem 0' }} />

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C' }}>
              <span>Handmade</span>
              <span>•</span>
              <span>Art</span>
              <span>•</span>
              <span>Design</span>
              <span>•</span>
              <span>Bespoke Living</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#A8A29E', marginTop: '1rem' }}>
              © {new Date().getFullYear()} THE SHEFALIS SPACE. All rights reserved. Handcrafted contemporary studio.
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
    </>
  );
};

export default App;
