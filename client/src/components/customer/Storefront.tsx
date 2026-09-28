import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Search, ShoppingBag, Heart
} from 'lucide-react';

export const Storefront: React.FC = () => {
  const {
    products, setActiveProductForDetails,
    addToCart
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const categories = [
    'ALL',
    'Art & Sculptures',
    'Bags & Leather',
    'Ceramics & Pottery',
    'Studio Decor',
    'Lifestyle & Living'
  ];

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.synopsis && p.synopsis.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) ||
      (p.tag && p.tag.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>

      {/* ── SECTION 1: SPLIT HERO (Matches Screenshot 1) ── */}
      <section style={{
        width: '100%',
        borderRadius: '0px',
        overflow: 'hidden',
        border: '1px solid #EAE5D4',
        boxShadow: '0 8px 32px rgba(28, 25, 23, 0.03)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          minHeight: '520px'
        }}>

          {/* Left Side: Soft Warm Butter Yellow */}
          <div style={{
            backgroundColor: '#F6E58D',
            padding: 'clamp(2.5rem, 5vw, 4.5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#4A3E1B',
              marginBottom: '1.25rem'
            }}>
              HANDMADE · ART · DESIGN
            </div>

            <h1 className="font-editorial" style={{
              fontSize: 'clamp(2.5rem, 4.8vw, 4rem)',
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.08,
              color: '#1C1917',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              Made with soul.<br />
              With Passion and<br />
              Meditation..
            </h1>

            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#38332A',
              maxWidth: '380px',
              marginBottom: '2.25rem',
              fontWeight: 400
            }}>
              A contemporary studio for handmade pieces, thoughtful details and creative living.
            </p>

            <div>
              <button
                onClick={scrollToCollection}
                style={{
                  backgroundColor: '#1C1917',
                  color: '#FAF7EE',
                  border: 'none',
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  transition: 'transform 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1C1917';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <span>EXPLORE COLLECTION</span>
              </button>
            </div>
          </div>

          {/* Right Side: Architectural Arch Motif & Golden Sun Emblem */}
          <div style={{
            backgroundColor: '#F6E58D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem',
            position: 'relative',
            borderLeft: '1px solid rgba(28, 25, 23, 0.06)'
          }}>
            <div style={{
              width: '280px',
              height: '380px',
              borderTopLeftRadius: '140px',
              borderTopRightRadius: '140px',
              border: '1px solid rgba(28, 25, 23, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Central Gold Medallion */}
              <div style={{
                width: '170px',
                height: '170px',
                borderRadius: '50%',
                backgroundColor: '#EAD068',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(184, 142, 40, 0.15)',
                padding: '1rem'
              }}>
                <span className="font-editorial" style={{
                  fontSize: '0.85rem',
                  letterSpacing: '0.2em',
                  color: '#1C1917',
                  textTransform: 'uppercase',
                  lineHeight: 1.2
                }}>
                  THE
                </span>
                <span className="font-editorial" style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#1C1917',
                  textTransform: 'uppercase',
                  lineHeight: 1.2
                }}>
                  SHEFALIs
                </span>
                <span className="font-editorial" style={{
                  fontSize: '0.85rem',
                  letterSpacing: '0.2em',
                  color: '#1C1917',
                  textTransform: 'uppercase',
                  lineHeight: 1.2
                }}>
                  SPACE
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: THE STUDIO STATEMENT (Matches Screenshot 2) ── */}
      <section id="the-studio" style={{
        textAlign: 'center',
        padding: '3rem 1rem 1rem',
        maxWidth: '820px',
        margin: '0 auto'
      }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#78716C',
          marginBottom: '1rem'
        }}>
          THE STUDIO
        </div>

        <h2 className="font-editorial" style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.18,
          color: '#1C1917',
          marginBottom: '1.25rem'
        }}>
          Crafted by hand, each with<br />its own story.
        </h2>

        <p style={{
          fontSize: '0.98rem',
          lineHeight: 1.7,
          color: '#57534E',
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          We create pieces that blend timeless aesthetics with artisanal craftsmanship, designed to bring serenity, tactile beauty, and soul to your everyday life.
        </p>
      </section>

      {/* ── SECTION 3: LATEST PIECES / COLLECTION (Matches Screenshot 3) ── */}
      <section id="collection" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Section Header & Filters */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          borderBottom: '1px solid #EAE5D4',
          paddingBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#78716C',
                display: 'block',
                marginBottom: '0.25rem'
              }}>
                CURATED INVENTORY
              </span>
              <h2 className="font-editorial" style={{
                fontSize: '2.5rem',
                fontWeight: 500,
                color: '#1C1917',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                Latest pieces
              </h2>
            </div>

            {/* Search and Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                <input
                  type="text"
                  placeholder="Search pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    fontSize: '0.82rem',
                    border: '1px solid #E2DDD0',
                    borderRadius: '4px',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1917',
                    outline: 'none'
                  }}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.82rem',
                  border: '1px solid #E2DDD0',
                  borderRadius: '4px',
                  backgroundColor: '#FFFFFF',
                  color: '#1C1917',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? '#1C1917' : 'transparent',
                  color: selectedCategory === cat ? '#FAF7EE' : '#57534E',
                  border: selectedCategory === cat ? '1px solid #1C1917' : '1px solid #E2DDD0',
                  borderRadius: '30px',
                  padding: '0.35rem 0.95rem',
                  fontSize: '0.78rem',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: '#FDFBF7',
            border: '1px dashed #D6D1C1',
            borderRadius: '8px'
          }}>
            <h3 className="font-editorial" style={{ fontSize: '1.6rem', color: '#1C1917' }}>No studio pieces found</h3>
            <p style={{ color: '#78716C', fontSize: '0.9rem' }}>Try refining your search keyword or browse all collection categories.</p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              style={{
                marginTop: '1rem',
                backgroundColor: '#1C1917',
                color: '#FAF7EE',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {filteredProducts.map((product) => {
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const isLiked = likedItems.has(product._id);
              const displayImage = product.coverImage || product.image || (product.images && product.images[0]) || '';

              return (
                <div
                  key={product._id}
                  onClick={() => setActiveProductForDetails(product)}
                  style={{
                    backgroundColor: '#FAF7EE',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image Container */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#EAE5D8',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: '1rem'
                  }}>
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={product.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.0)'; }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#E6DFC9',
                        color: '#78716C',
                        fontStyle: 'italic'
                      }}>
                        Studio Craft
                      </div>
                    )}

                    {/* Like button */}
                    <button
                      onClick={(e) => toggleLike(product._id, e)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isLiked ? '#EF4444' : '#1C1917',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <Heart size={15} fill={isLiked ? '#EF4444' : 'none'} />
                    </button>

                    {/* Category pill */}
                    <span style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(28, 25, 23, 0.85)',
                      color: '#FAF7EE',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {product.category || product.tag}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <h3 className="font-editorial" style={{
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: '#1C1917',
                      margin: 0,
                      lineHeight: 1.25
                    }}>
                      {product.title}
                    </h3>

                    <p style={{
                      fontSize: '0.8rem',
                      color: '#78716C',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {product.materials || product.synopsis}
                    </p>

                    {/* Price and Add button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #EAE5D4'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#1C1917'
                        }}>
                          ₹{product.price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span style={{
                            fontSize: '0.82rem',
                            color: '#A8A29E',
                            textDecoration: 'line-through'
                          }}>
                            ₹{product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        style={{
                          backgroundColor: '#1C1917',
                          color: '#FAF7EE',
                          border: 'none',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1C1917'; }}
                      >
                        <ShoppingBag size={12} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SECTION 4: STATEMENT BANNERS (Matches Screenshot 4) ── */}
      <section id="about" style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid #EAE5D4' }}>

        {/* Top Banner: Butter Yellow */}
        <div style={{
          backgroundColor: '#F6E58D',
          padding: 'clamp(2.5rem, 4vw, 3.75rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#4A3E1B',
              display: 'block',
              marginBottom: '0.75rem'
            }}>
              ABOUT
            </span>
            <h3 className="font-editorial" style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#1C1917',
              margin: 0
            }}>
              Creativity is<br />
              beyond boundaries.
            </h3>
          </div>

          <div>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: '#38332A',
              maxWidth: '460px',
              margin: 0
            }}>
              Our pieces are born at the intersection of traditional craftsmanship and modern minimalism, designed to be treasured for generations.
            </p>
          </div>
        </div>

        {/* Bottom Banner: Sand / Linen */}
        <div id="contact" style={{
          backgroundColor: '#EFE9D7',
          padding: 'clamp(2.5rem, 4vw, 3.75rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#78716C',
              display: 'block',
              marginBottom: '0.75rem'
            }}>
              COLLABORATION
            </span>
            <h3 className="font-editorial" style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#1C1917',
              margin: 0
            }}>
              Let's create together<br />
              something beautiful.
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <p style={{ fontSize: '0.95rem', color: '#57534E', margin: 0 }}>
              Have a bespoke commission or want to collaborate on custom pieces?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1C1917' }}>
                studio@theshefalisspace.com
              </span>
              <span style={{ fontSize: '0.85rem', color: '#78716C' }}>
                +91 98765 43210
              </span>
              <span style={{ fontSize: '0.75rem', color: '#78716C', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                STUDIO JAIPUR · INDIA
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* ── SECTION 5: STUDIO VALUES ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        padding: '2rem 0',
        borderTop: '1px solid #EAE5D4'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1C1917' }}>
            Artisanal Integrity
          </span>
          <p style={{ fontSize: '0.825rem', color: '#78716C', lineHeight: 1.6, margin: 0 }}>
            Every object is hand-crafted and finished in small studio batches with local raw materials.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1C1917' }}>
            Secure Studio Shipping
          </span>
          <p style={{ fontSize: '0.825rem', color: '#78716C', lineHeight: 1.6, margin: 0 }}>
            Insured packaging with fragile protection across all national and international delivery routes.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1C1917' }}>
            Google OpenID Fast Sign-In
          </span>
          <p style={{ fontSize: '0.825rem', color: '#78716C', lineHeight: 1.6, margin: 0 }}>
            Seamless one-tap account access with your Google account to track orders and save favorites.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1C1917' }}>
            Authenticity Guaranteed
          </span>
          <p style={{ fontSize: '0.825rem', color: '#78716C', lineHeight: 1.6, margin: 0 }}>
            Each collector piece includes signed documentation of studio provenance and care instructions.
          </p>
        </div>
      </section>

    </div>
  );
};
