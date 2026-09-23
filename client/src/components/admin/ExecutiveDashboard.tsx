import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock } from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { adminStats, setActiveTab, refreshAdminStats } = useApp();

  useEffect(() => {
    refreshAdminStats();
  }, []);

  if (!adminStats) {
    return (
      <div style={{ paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#57534E', letterSpacing: '0.08em' }}>
            ADMIN PANEL
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '0.2rem', color: '#1C1917' }}>
            Executive Business Dashboard
          </h1>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          color: '#78716C',
          fontSize: '1rem',
          gap: '0.75rem'
        }}>
          <Clock size={20} />
          Loading business metrics...
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Header Title */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#57534E', letterSpacing: '0.08em' }}>
          ADMIN PANEL
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '0.2rem', color: '#1C1917' }}>
          Executive Business Dashboard
        </h1>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="admin-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        
        {/* Revenue YTD */}
        <div className="card card-highlight" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#57534E', fontWeight: 600 }}>
            Revenue (YTD)
          </span>
          <div className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#1C1917', marginTop: '0.2rem' }}>
            ₹{adminStats.revenueYTD.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Orders */}
        <div className="card card-highlight" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#57534E', fontWeight: 600 }}>
            Total Orders
          </span>
          <div className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#1C1917', marginTop: '0.2rem' }}>
            {adminStats.totalOrders}
          </div>
        </div>

        {/* Registered Customers */}
        <div className="card card-highlight" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#57534E', fontWeight: 600 }}>
            Registered Customers
          </span>
          <div className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#1C1917', marginTop: '0.2rem' }}>
            {adminStats.registeredCustomers}
          </div>
        </div>

        {/* Books Catalog */}
        <div className="card card-highlight" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#57534E', fontWeight: 600 }}>
            Books Catalog
          </span>
          <div className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#1C1917', marginTop: '0.2rem' }}>
            {adminStats.booksCatalogCount} Titles
          </div>
        </div>

      </div>

      {/* Main Dark Chart Container & Transactions List */}
      <div style={{
        backgroundColor: '#1C1A17',
        border: '1px solid #2E2B27',
        borderRadius: '20px',
        padding: '2rem',
        color: '#FFFFFF',
        boxShadow: 'var(--shadow-medium)'
      }}>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          borderBottom: '1px solid #2E2B27',
          paddingBottom: '1rem'
        }}>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
              Monthly Sales Revenue (2026)
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#A8A29E' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
            Live Data
          </div>
        </div>

        <div className="dashboard-chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem', alignItems: 'end' }}>
          
          {/* Bar Chart Visualization */}
          {adminStats.monthlySales2026 && adminStats.monthlySales2026.length > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: '220px',
              paddingBottom: '1rem',
              borderBottom: '1px solid #2E2B27'
            }}>
              {adminStats.monthlySales2026.map((m, idx) => (
                <div
                  key={m.month || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  {/* Bar */}
                  <div
                    title={`₹${m.revenue}`}
                    style={{
                      width: '74px',
                      height: `${m.heightPercentage}%`,
                      backgroundColor: m.active ? '#FDF4C7' : '#476355',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease',
                      boxShadow: m.active ? '0 0 20px rgba(253,244,199,0.3)' : 'none'
                    }}
                  />
                  {/* Month Label */}
                  <span style={{ fontSize: '0.85rem', color: m.active ? '#FDF4C7' : '#A8A29E', fontWeight: m.active ? 700 : 500 }}>
                    {m.month}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#A8A29E', fontSize: '0.9rem' }}>
              No monthly data available yet
            </div>
          )}

          {/* Recent Transactions List */}
          <div style={{
            backgroundColor: '#26231F',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #36322D'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F5F5F4', marginBottom: '1rem' }}>
              Recent Transactions
            </h4>

            {adminStats.recentTransactions && adminStats.recentTransactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {adminStats.recentTransactions.slice(0, 4).map((tx, idx) => (
                  <div
                    key={tx._id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.825rem',
                      paddingBottom: '0.5rem',
                      borderBottom: idx < Math.min(3, adminStats.recentTransactions.length - 1) ? '1px solid #36322D' : 'none'
                    }}
                  >
                    <span style={{ color: '#D6D3D1', fontWeight: 500 }}>
                      {tx.orderNumber} • {tx.bookTitle}
                    </span>
                    <span style={{ color: '#4ADE80', fontWeight: 700 }}>
                      +₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#78716C', fontSize: '0.85rem' }}>No transactions yet.</p>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => setActiveTab('orders')}
              style={{
                width: '100%',
                marginTop: '1rem',
                fontSize: '0.75rem',
                padding: '0.45rem',
                backgroundColor: '#1C1A17',
                borderColor: '#36322D',
                color: '#F5F5F4'
              }}
            >
              View All Orders Log
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
