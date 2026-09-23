import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Storefront } from './components/customer/Storefront';
import { BookDetailsModal } from './components/customer/BookDetailsModal';
import { AuthModal } from './components/customer/AuthModal';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { UserShelf } from './components/customer/UserShelf';
import { WebReader } from './components/customer/WebReader';
import { ExecutiveDashboard } from './components/admin/ExecutiveDashboard';
import { CatalogControl } from './components/admin/CatalogControl';
import { OrderTracking } from './components/admin/OrderTracking';
import { BookOpen } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeMode, setActiveMode, activeTab, user } = useApp();

  // Enforce strict role boundary: Non-admin users cannot access admin mode, and admins are strictly in admin portal
  useEffect(() => {
    if (user?.role === 'admin' && activeMode !== 'admin') {
      setActiveMode('admin');
    } else if (activeMode === 'admin' && user?.role !== 'admin') {
      setActiveMode('customer');
    }
  }, [activeMode, user, setActiveMode]);

  const isAdminView = user?.role === 'admin';

  return (
    <main className="container" style={{ paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)', minHeight: 'calc(100vh - 160px)' }}>
      {isAdminView ? (
        activeTab === 'dashboard' ? <ExecutiveDashboard /> :
        activeTab === 'orders' ? <OrderTracking /> :
        <CatalogControl />
      ) : (
        activeTab === 'my-shelf' ? <UserShelf /> : <Storefront />
      )}

      {/* Modals for customer interactions - preview, reader, and checkout are only accessible after login */}
      {!isAdminView && user && (
        <>
          <BookDetailsModal />
          <CheckoutModal />
          <WebReader />
        </>
      )}
      <AuthModal />
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div style={{ backgroundColor: '#FAF7EE', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <MainContent />

        {/* Footer */}
        <footer style={{
          backgroundColor: '#FAF7EE',
          borderTop: '1px solid #E7E3D4',
          padding: '3rem 0',
          marginTop: 'auto',
          textAlign: 'center'
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#E8F2EC',
              color: '#2E5A44',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <BookOpen size={20} />
            </div>

            <h2 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1C1917' }}>
              Sefali's Library
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#57534E', maxWidth: '520px' }}>
              Editorial Digital Publishing House & Role-Based Administrative Control Center.
            </p>

            <div style={{ width: '40px', height: '2px', backgroundColor: '#2E5A44', marginTop: '0.5rem' }} />
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;
