import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export const UserShelf: React.FC = () => {
  const {
    books,
    user,
    setActiveTab,
    setAuthModalOpen,
    setActiveProductForDetails
  } = useApp();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1.5rem', backgroundColor: '#FAF7EE', borderRadius: '16px', margin: '2rem 0' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#F6E58D',
          color: '#1C1917',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <ShoppingBag size={32} />
        </div>
        <h2 className="font-serif" style={{ fontSize: '2.2rem', color: '#1C1917', marginBottom: '0.6rem', fontWeight: 700 }}>
          Your Studio Collection
        </h2>
        <p style={{ color: '#57534E', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Sign in to view your placed orders, track handcrafted piece deliveries, and manage your studio account.
        </p>
        <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)} style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
          Sign In / Register
        </button>
      </div>
    );
  }

  // Get user's purchased items
  const userPurchasedItems: Product[] = books.filter(b => {
    if (!user.purchasedBooks) return false;
    return user.purchasedBooks.some((p: any) =>
      typeof p === 'string' ? (p === b._id || p === b.title) : (p._id === b._id || p.title === b.title)
    );
  });

  return (
    <div style={{ paddingBottom: '5rem', paddingTop: '1rem' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #EAE5D5', paddingBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A08020', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          STUDIO PURCHASES & TRACKING
        </span>
        <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: 700, marginTop: '0.3rem', color: '#1C1917' }}>
          My Orders & Collection
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#78716C', margin: '0.4rem 0 0 0', lineHeight: 1.5 }}>
          Welcome back, {user.name}. Here are your handcrafted pieces and studio acquisitions.
        </p>
      </div>

      <div className="shelf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Left Column: Orders List */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D5',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #EAE5D5',
            marginBottom: '1.75rem'
          }}>
            <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              Acquired Pieces ({userPurchasedItems.length})
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A08020', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Verified Collector
            </span>
          </div>

          {userPurchasedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#78716C' }}>
              <Package size={44} style={{ color: '#D6D0C2', margin: '0 auto 1rem auto' }} />
              <h3 className="font-serif" style={{ fontSize: '1.4rem', color: '#1C1917', marginBottom: '0.5rem' }}>No Studio Orders Yet</h3>
              <p style={{ fontSize: '0.95rem', marginBottom: '1.75rem', maxWidth: '380px', margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
                Explore our latest handmade pieces, art sculptures, and contemporary home decor.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('storefront')} style={{ padding: '0.8rem 1.8rem' }}>
                Explore Collection
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {userPurchasedItems.map(item => {
                return (
                  <div
                    key={item._id}
                    className="shelf-item-card"
                    style={{
                      backgroundColor: '#FAF7EE',
                      border: '1px solid #EAE5D5',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      transition: 'all 0.2s ease',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: 0 }}>
                      <img
                        src={item.coverImage || item.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300'}
                        alt={item.title}
                        style={{ width: '76px', height: '76px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #EAE5D5', flexShrink: 0 }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#8C827A', letterSpacing: '0.08em' }}>
                          {item.category || item.tag}
                        </span>
                        <h3 className="font-serif" style={{ fontSize: 'clamp(1rem, 3.5vw, 1.3rem)', fontWeight: 700, color: '#1C1917', margin: '0.2rem 0', wordBreak: 'break-word' }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#78716C', margin: '0 0 0.5rem 0', wordBreak: 'break-word' }}>
                          ₹{item.price} • {item.materials || 'Handcrafted piece'}
                        </p>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#2E5A44', backgroundColor: '#E8F2EC', padding: '0.25rem 0.6rem', borderRadius: '4px', flexWrap: 'wrap' }}>
                          <Truck size={13} /> Order Dispatched • Est. 2 Days
                        </div>
                      </div>
                    </div>

                    <div className="shelf-item-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setActiveProductForDetails(item)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        Piece Details
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ backgroundColor: '#FAF7EE', border: '1px solid #EAE5D5', padding: '1.5rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem', color: '#1C1917' }}>
              Studio Authenticity
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#57534E', lineHeight: 1.6, margin: 0 }}>
              Each piece ordered through <strong>THE SHEFALIS SPACE</strong> is accompanied by a certificate of authenticity signed by the artisan.
            </p>
          </div>

          <div className="card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE5D5', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} style={{ color: '#1C1917' }} />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#1C1917', margin: 0 }}>
                Care & Warranty
              </h4>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#57534E', lineHeight: 1.6, margin: 0 }}>
              Our pieces are crafted using sustainable and raw materials. Spot clean gently with soft cotton and keep away from abrasive chemicals.
            </p>
          </div>

          <div className="card" style={{ backgroundColor: '#F8E79B', border: '1px solid #E5D285', padding: '1.5rem' }}>
            <h4 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.4rem' }}>
              Need Bespoke Customization?
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#4A4333', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Commission custom dimensions, exclusive glaze finishes, or personalized engravings directly with our studio artists.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab('storefront')}
              style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem' }}
            >
              Contact Studio
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
