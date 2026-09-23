import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isCartDrawerOpen, setIsCartDrawerOpen, removeFromCart, setCheckoutBook, user, setAuthModalOpen } = useApp();

  if (!user || !isCartDrawerOpen) return null;

  const cartTotal = cart.reduce((sum, item) => sum + item.book.price, 0);

  const handleProceedToCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    // Set checkout book to first item or trigger cart checkout modal
    setCheckoutBook(cart[0].book);
    setIsCartDrawerOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#FAF7EE',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E7E3D4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              backgroundColor: '#E8F2EC',
              color: '#2E5A44',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1C1917' }}>
                Your Reading Cart
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#78716C', margin: 0 }}>
                {cart.length} {cart.length === 1 ? 'item' : 'items'} ready for instant delivery
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#78716C',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#F5F5F4',
                color: '#A8A29E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-serif" style={{ fontSize: '1.15rem', color: '#1C1917', margin: 0 }}>Your cart is empty</h4>
              <p style={{ fontSize: '0.875rem', color: '#78716C', maxWidth: '280px', margin: 0 }}>
                Explore our editorial catalog to find engineering masterclasses and strategic architecture handbooks.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(({ book, format }) => (
                <div
                  key={book._id}
                  style={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E7E3D4',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '76px',
                    borderRadius: '6px',
                    background: book.coverGradient || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: '#FFF',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
                      {book.tag}
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.1 }}>
                      {book.title}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {book.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#78716C', margin: '0 0 0.5rem 0' }}>
                      By {book.author}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: '#E8F2EC',
                        color: '#2E5A44',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        {format}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#A8A29E' }}>
                        Instant Digital Access
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#2E5A44' }}>
                      ₹{book.price}
                    </span>
                    <button
                      onClick={() => removeFromCart(book._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#FFF',
            borderTop: '1px solid #E7E3D4',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', color: '#78716C' }}>Total Investment:</span>
              <span className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1C1917' }}>
                ₹{cartTotal}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#57534E',
              backgroundColor: '#FAF7EE',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px'
            }}>
              <ShieldCheck size={16} style={{ color: '#2E5A44' }} />
              <span>Includes lifetime reading access, EPUB & PDF formats, and DRM-free sync.</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              style={{
                width: '100%',
                backgroundColor: '#2E5A44',
                color: '#FFF',
                border: 'none',
                padding: '0.9rem 1.25rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(46, 90, 68, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <span>{user ? 'Proceed to Instant Checkout' : 'Log in to Checkout'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
