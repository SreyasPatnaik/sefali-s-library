import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    setCheckoutProduct,
    user,
    setAuthModalOpen,
    setAuthModalTab
  } = useApp();

  if (!isCartDrawerOpen) return null;

  const cartTotal = cart.reduce((sum, item) => sum + (item.book.price * (item.quantity || 1)), 0);
  const totalItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleProceedToCheckout = () => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    if (cart.length > 0) {
      setCheckoutProduct(cart[0].book);
      setIsCartDrawerOpen(false);
    }
  };

  return (
    <div
      onClick={() => setIsCartDrawerOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.6)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FAF7EE',
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #EAE5D4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FAF7EE'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              backgroundColor: '#1C1917',
              color: '#F6E58D',
              padding: '0.45rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="font-editorial" style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0, color: '#1C1917' }}>
                Studio Shopping Bag
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#78716C', margin: 0 }}>
                {totalItemCount} {totalItemCount === 1 ? 'piece' : 'pieces'} selected
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
              borderRadius: '50%',
              backgroundColor: '#EAE6D8',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#EAE6D8',
                color: '#78716C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-editorial" style={{ fontSize: '1.4rem', color: '#1C1917', margin: 0 }}>
                Your studio bag is empty
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#78716C', maxWidth: '280px', margin: 0 }}>
                Discover handcrafted ceramics, artisan leather bags, and minimal lifestyle sculptures.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(({ book: product, format, quantity = 1 }) => {
                const img = product.image || (product.images && product.images[0]) || '';
                return (
                  <div
                    key={product._id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE5D4',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(28, 25, 23, 0.02)'
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '4px',
                      backgroundColor: '#EAE5D8',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {img ? (
                        <img src={img} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: product.coverGradient || '#1c1917',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FAF7EE',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {product.title.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 className="font-editorial" style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        margin: '0 0 0.15rem 0',
                        color: '#1C1917',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#78716C', margin: '0 0 0.4rem 0' }}>
                        {product.category || product.tag}
                      </p>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateCartQuantity(product._id, quantity - 1)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '3px',
                            border: '1px solid #D6D3CA',
                            background: '#FAF7EE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product._id, quantity + 1)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '3px',
                            border: '1px solid #D6D3CA',
                            background: '#FAF7EE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Price & Delete */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1C1917' }}>
                        ₹{(product.price * quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(product._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#A8A29E',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remove piece"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#FAF7EE',
            borderTop: '1px solid #EAE5D4',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Estimated Total:
              </span>
              <span className="font-editorial" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1C1917' }}>
                ₹{cartTotal.toLocaleString()}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#57534E',
              backgroundColor: '#F3EEDB',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px'
            }}>
              <ShieldCheck size={16} style={{ color: '#1C1917', flexShrink: 0 }} />
              <span>Includes insured studio packaging, tax invoices, and doorstep delivery.</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              style={{
                width: '100%',
                backgroundColor: '#1C1917',
                color: '#FAF7EE',
                border: 'none',
                padding: '0.9rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1C1917'; }}
            >
              <span>{user ? 'Proceed to Secure Checkout' : 'Sign In & Complete Order'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
