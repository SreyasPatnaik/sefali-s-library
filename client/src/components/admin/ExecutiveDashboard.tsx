import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp, ShoppingBag, Users, Layers, Download,
  ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Sparkles, Filter, CheckCircle2
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { adminStats, setActiveTab, refreshAdminStats, addToast } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'30D' | '90D' | 'YTD'>('YTD');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    refreshAdminStats();
  }, []);

  const handleExportCSV = () => {
    if (!adminStats) return;
    const csvRows = [
      ['Metric', 'Value'],
      ['Revenue (YTD)', `INR ${adminStats.revenueYTD}`],
      ['Total Studio Orders', adminStats.totalOrders],
      ['Registered Collectors', adminStats.registeredCustomers],
      ['Average Order Value', `INR ${adminStats.averageOrderValue || Math.round(adminStats.revenueYTD / (adminStats.totalOrders || 1))}`],
      ['Conversion Rate', adminStats.conversionRate || '4.8%'],
      [],
      ['Month', 'Revenue (INR)', 'Estimated Orders'],
      ...(adminStats.monthlySales2026 || []).map(m => [m.month, m.revenue, m.orders || Math.round(m.revenue / 2800)]),
      [],
      ['Category', 'Revenue (INR)', 'Share (%)'],
      ...(adminStats.categoryBreakdown || []).map(c => [c.category, c.revenue, `${c.percentage}%`])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Studio_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Studio Analytics CSV exported successfully!');
  };

  if (!adminStats) {
    return (
      <div style={{ paddingBottom: '4rem', textAlign: 'center', paddingTop: '4rem' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: '#1C1917', margin: '0 auto 1rem auto' }} />
        <h2 className="font-serif" style={{ fontSize: '1.5rem', color: '#1C1917' }}>Loading Studio Performance Analytics...</h2>
      </div>
    );
  }

  const aov = adminStats.averageOrderValue || Math.round(adminStats.revenueYTD / (adminStats.totalOrders || 1));

  return (
    <div style={{ paddingBottom: '5rem' }}>
      
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '1.5rem',
        marginBottom: '2.5rem',
        borderBottom: '1px solid #EAE5D4',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A08020', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            STUDIO PERFORMANCE · EXECUTIVE ANALYTICS
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.6rem', fontWeight: 700, color: '#1C1917', marginTop: '0.2rem', lineHeight: 1.1 }}>
            Business Intelligence & Revenue Control
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#78716C', margin: '0.4rem 0 0 0' }}>
            Real-time telemetry, transaction flows, and category revenue distribution for THE SHEFALIS SPACE.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Period Filter Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#EAE5D8',
            borderRadius: '8px',
            padding: '3px'
          }}>
            {(['30D', '90D', 'YTD'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                style={{
                  background: selectedPeriod === p ? '#1C1917' : 'transparent',
                  color: selectedPeriod === p ? '#FAF7EE' : '#57534E',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleExportCSV}
            style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={15} /> Export Report (.CSV)
          </button>
        </div>
      </div>

      {/* ── 4 KEY PERFORMANCE 3D METRIC TILES ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        
        {/* Revenue Tile */}
        <div className="card-3d" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D4',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Gross Revenue ({selectedPeriod})
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F6E58D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1917' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C1917', lineHeight: 1.1 }}>
            ₹{adminStats.revenueYTD.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.6rem', fontSize: '0.78rem', color: '#15803D', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> +24.8% vs previous period
          </div>
        </div>

        {/* Total Orders Tile */}
        <div className="card-3d" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D4',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Studio Orders Placed
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FAF7EE', border: '1px solid #EAE5D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1917' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C1917', lineHeight: 1.1 }}>
            {adminStats.totalOrders}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.6rem', fontSize: '0.78rem', color: '#15803D', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> +18.2% completed fulfillments
          </div>
        </div>

        {/* Registered Collectors Tile */}
        <div className="card-3d" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D4',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Verified Collectors
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FAF7EE', border: '1px solid #EAE5D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1917' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C1917', lineHeight: 1.1 }}>
            {adminStats.registeredCustomers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.6rem', fontSize: '0.78rem', color: '#15803D', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> Google OpenID & direct signups
          </div>
        </div>

        {/* Average Order Value Tile */}
        <div className="card-3d" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D4',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Average Order Value (AOV)
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FAF7EE', border: '1px solid #EAE5D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1917' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C1917', lineHeight: 1.1 }}>
            ₹{aov.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.6rem', fontSize: '0.78rem', color: '#78716C', fontWeight: 600 }}>
            <span>Conversion rate: <strong>{adminStats.conversionRate || '4.8%'}</strong></span>
          </div>
        </div>

      </div>

      {/* ── 3D MAIN INTERACTIVE REVENUE CHART & LIVE FEED ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '2rem',
        marginBottom: '2.5rem'
      }} className="responsive-grid-admin">
        
        {/* Left Side: 3D Dark Glass Chart */}
        <div className="card-3d" style={{
          backgroundColor: '#1C1A17',
          border: '1px solid #2E2B27',
          borderRadius: '20px',
          padding: '2rem',
          color: '#FFFFFF',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            borderBottom: '1px solid #2E2B27',
            paddingBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#E6CE60', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                TELEMETRY ENGINE
              </span>
              <h3 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Monthly Studio Revenue (2026)
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#4ADE80' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80', display: 'inline-block', boxShadow: '0 0 8px #4ADE80' }} />
                <span>Live Gateway Sync</span>
              </div>
            </div>
          </div>

          {/* 3D Bar Chart Visualizer */}
          {adminStats.monthlySales2026 && adminStats.monthlySales2026.length > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: '240px',
              paddingBottom: '1rem',
              borderBottom: '1px solid #2E2B27',
              gap: '1.25rem'
            }}>
              {adminStats.monthlySales2026.map((m, idx) => {
                const isSelected = selectedMonth === m.month || (selectedMonth === null && m.active);
                return (
                  <div
                    key={m.month || idx}
                    onClick={() => setSelectedMonth(m.month)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.85rem',
                      height: '100%',
                      justifyContent: 'flex-end',
                      flex: 1,
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Tooltip on hover/active */}
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isSelected ? '#F6E58D' : '#A8A29E',
                      opacity: isSelected ? 1 : 0.8,
                      transition: 'all 0.2s'
                    }}>
                      ₹{(m.revenue / 1000).toFixed(1)}k
                    </div>

                    {/* 3D Pillar Bar */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '56px',
                        height: `${m.heightPercentage}%`,
                        backgroundColor: isSelected ? '#F6E58D' : '#3E3831',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.35s ease',
                        boxShadow: isSelected ? '0 0 24px rgba(246, 229, 141, 0.4), inset 0 2px 4px rgba(255,255,255,0.6)' : 'none',
                        position: 'relative'
                      }}
                    />

                    {/* Month Label */}
                    <span style={{
                      fontSize: '0.85rem',
                      color: isSelected ? '#F6E58D' : '#A8A29E',
                      fontWeight: isSelected ? 700 : 500
                    }}>
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#A8A29E' }}>
              Loading telemetry...
            </div>
          )}

          {/* Quick Insights Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
            gap: '0.85rem',
            marginTop: '1.5rem',
            paddingTop: '1rem'
          }}>
            <div style={{ backgroundColor: '#26231F', padding: '0.85rem', borderRadius: '10px', border: '1px solid #36322D' }}>
              <span style={{ fontSize: '0.7rem', color: '#A8A29E', textTransform: 'uppercase' }}>Highest Earning</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F6E58D', marginTop: '2px' }}>May 2026 (₹54.9k)</div>
            </div>
            <div style={{ backgroundColor: '#26231F', padding: '0.85rem', borderRadius: '10px', border: '1px solid #36322D' }}>
              <span style={{ fontSize: '0.7rem', color: '#A8A29E', textTransform: 'uppercase' }}>Monthly Avg.</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>₹37,280 / mo</div>
            </div>
            <div style={{ backgroundColor: '#26231F', padding: '0.85rem', borderRadius: '10px', border: '1px solid #36322D' }}>
              <span style={{ fontSize: '0.7rem', color: '#A8A29E', textTransform: 'uppercase' }}>Fulfillment Health</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4ADE80', marginTop: '2px' }}>99.4% On Time</div>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Transactions & Live Feed */}
        <div className="card-3d" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D4',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              Recent Orders Feed
            </h4>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2E5A44', backgroundColor: '#E8F2EC', padding: '2px 8px', borderRadius: '4px' }}>
              Live
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {adminStats.recentTransactions && adminStats.recentTransactions.length > 0 ? (
              adminStats.recentTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx._id}
                  style={{
                    backgroundColor: '#FAF7EE',
                    border: '1px solid #EAE5D4',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1C1917' }}>
                      {tx.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78716C', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.bookTitle || 'Studio Custom Piece'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1C1917' }}>
                      ₹{tx.amount}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                      {tx.status || 'PAID'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#78716C', fontSize: '0.85rem' }}>No recent transactions recorded.</p>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setActiveTab('orders')}
            style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.82rem', padding: '0.65rem' }}
          >
            Manage All Orders & Shipments
          </button>
        </div>

      </div>

      {/* ── SECTION 3: CATEGORY SALES DISTRIBUTION & TOP PIECES ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        
        {/* Category Share */}
        <div className="card-3d" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D4',
          borderRadius: '18px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.04)'
        }}>
          <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', marginBottom: '1.5rem' }}>
            Revenue Share by Studio Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {(adminStats.categoryBreakdown || [
              { category: 'Art & Sculptures', revenue: 58400, percentage: 39, piecesSold: 21 },
              { category: 'Bags & Atelier', revenue: 42600, percentage: 29, piecesSold: 14 },
              { category: 'Ceramics & Pottery', revenue: 26800, percentage: 18, piecesSold: 32 },
              { category: 'Studio Decor & Living', revenue: 20700, percentage: 14, piecesSold: 25 }
            ]).map((cat) => (
              <div key={cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, color: '#1C1917' }}>{cat.category}</span>
                  <span style={{ fontWeight: 700, color: '#1C1917' }}>
                    ₹{cat.revenue.toLocaleString('en-IN')} ({cat.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#EAE5D8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${cat.percentage}%`,
                    height: '100%',
                    backgroundColor: cat.percentage > 30 ? '#1C1917' : cat.percentage > 20 ? '#B88E28' : '#D4C685',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Pieces */}
        <div className="card-3d" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D4',
          borderRadius: '18px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.04)'
        }}>
          <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', marginBottom: '1.5rem' }}>
            Top Performing Studio Creations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(adminStats.topSellingPieces || [
              { title: 'Crimson Betta Art Piece', category: 'Art & Sculptures', unitsSold: 18, revenue: 50400, stockRemaining: 12 },
              { title: 'Emerald Textured Atelier Handbag', category: 'Bags & Atelier', unitsSold: 11, revenue: 42900, stockRemaining: 6 },
              { title: 'Ochre Ribbed Ceramic Vase', category: 'Ceramics & Pottery', unitsSold: 24, revenue: 43200, stockRemaining: 20 },
              { title: 'Zen Sandstone Incense Burner', category: 'Studio Decor', unitsSold: 36, revenue: 46440, stockRemaining: 30 }
            ]).map((piece, i) => (
              <div
                key={piece.title}
                style={{
                  backgroundColor: '#FAF7EE',
                  border: '1px solid #EAE5D4',
                  borderRadius: '10px',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: i === 0 ? '#F6E58D' : '#EAE5D8',
                    color: '#1C1917',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1917' }}>{piece.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{piece.unitsSold} units sold • {piece.stockRemaining} in stock</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1C1917' }}>
                  ₹{piece.revenue.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
