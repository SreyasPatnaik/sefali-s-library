import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, Eye, ShoppingCart, CheckCircle, Zap, Star, Plus, MessageSquare, Send } from 'lucide-react';

export const BookDetailsModal: React.FC = () => {
  const {
    activeBookForDetails,
    setActiveBookForDetails,
    setActiveBookForReader,
    setReaderIsSample,
    setCheckoutBook,
    addToCart,
    user,
    submitReview,
    setAuthModalOpen
  } = useApp();

  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  if (!user || !activeBookForDetails) return null;

  const book = activeBookForDetails;

  const isPurchased = user?.purchasedBooks?.some((b: any) =>
    typeof b === 'string' ? b === book._id || b === book.title : b._id === book._id || b.title === book.title
  );

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await submitReview(book._id, reviewRating, reviewComment);
      setReviewComment('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveBookForDetails(null)}>
      <div
        className="modal-content animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', padding: 0, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          backgroundColor: '#FAF7EE',
          borderBottom: '1px solid #E7E3D4'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2E5A44', letterSpacing: '0.08em' }}>
              HANDBOOK DETAILS & REVIEWS
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              {book.title}
            </h3>
          </div>
          <button
            onClick={() => setActiveBookForDetails(null)}
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

        {/* Content Scroll Area */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main Book Hero Info */}
          <div className="modal-book-hero-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Book Cover */}
            <div className="modal-book-hero-cover" style={{
              width: '100%',
              height: '270px',
              borderRadius: '12px',
              background: book.coverGradient || 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
              color: '#FFFFFF',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px rgba(0,0,0,0.18)'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em' }}>{book.tag}</span>
              <div>
                <h4 style={{ fontSize: '1.1rem', lineHeight: 1.25, fontWeight: 700 }}>
                  {book.title}
                </h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.3rem' }}>{book.edition}</p>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>By {book.author}</span>
            </div>

            {/* Metadata & CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#D97706', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Star size={16} fill="#D97706" /> {book.rating || 4.9}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    ({book.reviews?.length || 0} customer reviews)
                  </span>
                </div>

                <h2 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.25rem' }}>
                  {book.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#78716C', marginBottom: '1rem' }}>
                  By {book.author} • {book.edition} • {book.pageCount || 180} Pages
                </p>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  {book.ebookFile && (
                    <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }}>
                      📄 Authentic PDF Document Attached
                    </span>
                  )}
                  <span className="badge badge-yellow">
                    {book.formats.join(' + ')}
                  </span>
                  <span className="badge badge-green">
                    <Zap size={12} /> {book.deliveryTag}
                  </span>
                  <span className="badge" style={{ backgroundColor: '#E8F2EC', color: '#2E5A44' }}>
                    {book.readingMood || 'High Scalability'}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#57534E', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {book.synopsis}
                </p>
              </div>

              {/* Action Bar */}
              <div className="modal-book-action-row" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid #E7E3D4'
              }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E5A44' }}>
                  ₹{book.price}
                </div>

                <div className="modal-book-btn-group" style={{ display: 'flex', gap: '0.75rem' }}>
                  {isPurchased ? (
                    <button
                      className="btn btn-green"
                      onClick={() => {
                        setActiveBookForDetails(null);
                        setActiveBookForReader(book);
                        setReaderIsSample(false);
                      }}
                    >
                      <BookOpen size={16} /> Read E-Book (Open PDF)
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => addToCart(book)}
                        style={{ fontSize: '0.85rem' }}
                      >
                        <Plus size={16} /> Add to Cart
                      </button>

                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setActiveBookForDetails(null);
                          setCheckoutBook(book);
                        }}
                        style={{ padding: '0.65rem 1.4rem' }}
                      >
                        <ShoppingCart size={16} /> Buy E-Book
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setActiveBookForDetails(null);
                          setActiveBookForReader(book);
                          setReaderIsSample(true);
                        }}
                      >
                        <Eye size={16} /> Preview Sample
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Customer Reviews Section */}
          <div style={{ borderTop: '1px solid #E7E3D4', paddingTop: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={20} style={{ color: '#2E5A44' }} />
                <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1C1917' }}>
                  Peer & Customer Reviews ({book.reviews?.length || 0})
                </h3>
              </div>
            </div>

            {/* Write Review Form */}
            <form onSubmit={handlePostReview} style={{
              backgroundColor: '#FAF7EE',
              border: '1px solid #E7E3D4',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#1C1917' }}>
                {user ? 'Leave an Editorial Review' : 'Sign in to write a review'}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#57534E' }}>Your Rating:</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star
                      size={18}
                      fill={star <= reviewRating ? '#D97706' : 'none'}
                      color={star <= reviewRating ? '#D97706' : '#A8A29E'}
                    />
                  </button>
                ))}
              </div>

              <div className="review-form-row" style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Share your thoughts on the architectural design patterns in this handbook..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingReview}
                  style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                >
                  <Send size={15} />
                  Post Review
                </button>
              </div>
            </form>

            {/* Reviews List */}
            {(!book.reviews || book.reviews.length === 0) ? (
              <p style={{ fontSize: '0.875rem', color: '#78716C', fontStyle: 'italic' }}>
                No reviews yet. Be the first senior engineer to review this publication!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {book.reviews.map((rev, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E7E3D4',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1C1917' }}>{rev.userName}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={13} fill="#D97706" color="#D97706" />
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#A8A29E' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#57534E', margin: 0, lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
