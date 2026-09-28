import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShoppingBag, Star, ShieldCheck, Check, Heart, Send, Sparkles } from 'lucide-react';

export const BookDetailsModal: React.FC = () => {
  const {
    activeProductForDetails,
    setActiveProductForDetails,
    setCheckoutProduct,
    addToCart,
    user,
    submitReview,
    setAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);

  if (!activeProductForDetails) return null;

  const product = activeProductForDetails;
  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const activeImage = images[selectedImgIndex] || product.image || '';

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await submitReview(product._id, reviewRating, reviewComment);
      setReviewComment('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    setCheckoutProduct(product);
    setActiveProductForDetails(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveProductForDetails(null)}>
      <div
        className="modal-content animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          padding: 0,
          overflow: 'hidden',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FAF7EE'
        }}
      >
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #EAE5D4',
          backgroundColor: '#FAF7EE'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#78716C', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              THE SHEFALIS SPACE · {product.category || product.tag}
            </span>
            <h3 className="font-editorial" style={{ fontSize: '1.6rem', fontWeight: 600, color: '#1C1917', margin: 0 }}>
              {product.title}
            </h3>
          </div>

          <button
            onClick={() => setActiveProductForDetails(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#78716C',
              padding: '0.4rem',
              borderRadius: '50%',
              backgroundColor: '#EAE6D8',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>

            {/* Left: Product Images */}
            <div>
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: '#EAE5D8',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '0.75rem'
              }}>
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: product.coverGradient || 'linear-gradient(135deg, #2e2a27 0%, #1c1917 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FAF7EE',
                    padding: '2rem',
                    textAlign: 'center'
                  }}>
                    <span className="font-editorial" style={{ fontSize: '1.8rem' }}>{product.title}</span>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: selectedImgIndex === idx ? '2px solid #1C1917' : '1px solid #EAE5D4',
                        padding: 0,
                        cursor: 'pointer',
                        background: 'none'
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1C1917' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span style={{ fontSize: '1rem', color: '#A8A29E', textDecoration: 'line-through' }}>
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#B88E28', fontSize: '0.85rem' }}>
                  <Star size={15} fill="#B88E28" color="#B88E28" />
                  <span style={{ fontWeight: 700, color: '#1C1917' }}>{product.rating || 5.0}</span>
                  <span style={{ color: '#78716C' }}>({product.reviews?.length || 0} reviews)</span>
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#38332A', margin: 0 }}>
                {product.description || product.synopsis}
              </p>

              {/* Specifications Box */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAE5D4',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.825rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716C' }}>Materials</span>
                  <span style={{ fontWeight: 600, color: '#1C1917' }}>{product.materials || 'Handcrafted Studio Blend'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716C' }}>Dimensions</span>
                  <span style={{ fontWeight: 600, color: '#1C1917' }}>{product.dimensions || 'Studio Custom Size'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#78716C' }}>Availability</span>
                  <span style={{ fontWeight: 600, color: '#2E5A44' }}>
                    {product.inStock !== false ? `In Stock (${product.stockQuantity || 12} available)` : 'Made to Order'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    color: '#1C1917',
                    border: '1.5px solid #1C1917',
                    padding: '0.85rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F5F2E6'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF'; }}
                >
                  <ShoppingBag size={15} />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  style={{
                    flex: 1,
                    backgroundColor: '#1C1917',
                    color: '#FAF7EE',
                    border: 'none',
                    padding: '0.85rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1C1917'; }}
                >
                  <span>Instant Purchase</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#78716C' }}>
                <ShieldCheck size={14} color="#1C1917" />
                <span>Complimentary insured shipping & signature studio gift wrapping included.</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div style={{ borderTop: '1px solid #EAE5D4', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <h4 className="font-editorial" style={{ fontSize: '1.4rem', color: '#1C1917', marginBottom: '1rem' }}>
              Studio Reviews & Impressions
            </h4>

            {/* Existing Reviews */}
            {product.reviews && product.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {product.reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE5D4',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1C1917' }}>{rev.userName}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? '#B88E28' : 'none'}
                            color={i < rev.rating ? '#B88E28' : '#D6D3CA'}
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#57534E', margin: 0, lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#78716C', marginBottom: '1.5rem' }}>
                No reviews yet for this edition. Be the first to share your studio impression.
              </p>
            )}

            {/* Write a Review */}
            <form onSubmit={handlePostReview} style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE5D4',
              borderRadius: '8px',
              padding: '1.25rem'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1C1917', display: 'block', marginBottom: '0.5rem' }}>
                Leave a Verified Review
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star
                      size={18}
                      fill={star <= reviewRating ? '#B88E28' : 'none'}
                      color={star <= reviewRating ? '#B88E28' : '#D6D3CA'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.8rem', color: '#78716C', marginLeft: '0.4rem' }}>{reviewRating} of 5</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder={user ? "Share your thoughts on this handmade piece..." : "Sign in to leave a review..."}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.85rem',
                    border: '1px solid #EAE5D4',
                    borderRadius: '4px',
                    backgroundColor: '#FAF7EE',
                    outline: 'none'
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  style={{
                    backgroundColor: '#1C1917',
                    color: '#FAF7EE',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Send size={13} />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Post'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
