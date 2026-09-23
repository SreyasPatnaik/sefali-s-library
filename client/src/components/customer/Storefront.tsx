import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import {
  Search, Eye, ShoppingCart, Star, CheckCircle, Plus, Lock, Sparkles,
  BookOpen, FileText, ShieldCheck, Zap, ArrowRight, Award, Users,
  BookMarked, TrendingUp, Coffee, Cpu, Database, Globe, ChevronRight
} from 'lucide-react';

/* ─── Animated Counter Hook ─────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── Intersection Observer Hook ────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Particle Component ─────────────────────────────────────────────── */
const FloatingParticles: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: `${4 + (i % 4) * 2}px`,
          height: `${4 + (i % 4) * 2}px`,
          borderRadius: '50%',
          background: i % 3 === 0
            ? 'rgba(46,90,68,0.4)'
            : i % 3 === 1
              ? 'rgba(245,224,128,0.6)'
              : 'rgba(46,90,68,0.2)',
          left: `${8 + (i * 7.3) % 82}%`,
          top: `${15 + (i * 13.7) % 70}%`,
          animation: `particleDrift ${3.5 + (i % 3) * 1.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }}
      />
    ))}
  </div>
);

/* ─── Ticker Item ────────────────────────────────────────────────────── */
const tickerItems = [
  '✦ 1,200+ Engineers Reading',
  '🏆 Staff Engineer Approved',
  '⚡ Instant Access',
  '📄 100% DRM-Free',
  '✨ 2026 Digital Editions',
  '🎯 Production-Ready Architectures',
  '🔖 Interactive Web Reader',
  '💡 Chapter-by-Chapter Deep-Dives',
];

export const Storefront: React.FC = () => {
  const {
    books, setActiveBookForDetails, setActiveBookForReader,
    setReaderIsSample, setCheckoutBook, addToCart,
    user, setAuthModalOpen, setAuthModalTab, addToast
  } = useApp();

  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedTag, setSelectedTag]   = useState('ALL');
  const [sortBy, setSortBy]             = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [hoveredBook, setHoveredBook]   = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { ref: statsRef, inView: statsInView } = useInView();
  const readersCount = useCountUp(1200, 2000, statsInView);
  const booksCount   = useCountUp(books.length || 12, 1500, statsInView);
  const ratingCount  = useCountUp(49, 1800, statsInView);

  const featuredBook = books.find(b => b.featured) || books[0];
  const allTags = ['ALL', ...Array.from(new Set(books.map(b => b.tag?.toUpperCase()))).filter(Boolean)];

  const filteredBooks = books.filter(b => {
    const matchesTag    = selectedTag === 'ALL' || b.tag?.toUpperCase() === selectedTag.toUpperCase();
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc')  return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating')     return (b.rating || 0) - (a.rating || 0);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  // Stagger-animate book cards when they enter viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCards(prev => new Set(prev).add(i));
          obs.disconnect();
        }
      }, { threshold: 0.1 });
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [filteredBooks.length]);

  const isPurchased = (book: Book) => {
    if (!user || !user.purchasedBooks) return false;
    return user.purchasedBooks.some((b: any) =>
      typeof b === 'string' ? b === book._id || b === book.title : b._id === book._id || b.title === book.title
    );
  };

  const handleGuestPrompt = (message: string) => {
    setAuthModalTab('register');
    setAuthModalOpen(true);
    addToast('info', message);
  };

  const tagIcons: Record<string, React.ReactNode> = {
    'DISTRIBUTED SYSTEMS': <Cpu size={12} />,
    'BACKEND':             <Database size={12} />,
    'FRONTEND':            <Globe size={12} />,
    'ARCHITECTURE':        <TrendingUp size={12} />,
  };

  return (
    <div style={{ paddingBottom: '5rem' }} className="animate-fade-in">

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="hero-section" style={{
        background: 'linear-gradient(145deg, #FFFDF8 0%, #FAF7EE 40%, #F2EDD8 100%)',
        border: '1px solid #EAE3CF',
        borderRadius: '24px',
        padding: 'clamp(2rem, 5vw, 3.5rem)',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <FloatingParticles />

        {/* Top eyebrow badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span className="shimmer-badge badge badge-green" style={{ fontSize: '0.68rem', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
            ✦ 2026 DIGITAL MASTERCLASSES
          </span>
          <span style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 600 }}>
            DRM-Free · Instant Access · In-Browser Reading
          </span>
        </div>

        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: featuredBook ? 'minmax(0, 1fr) auto' : '1fr',
          alignItems: 'center',
          gap: '3rem',
        }}>
          {/* Left column */}
          <div style={{ zIndex: 1, maxWidth: '680px' }}>
            <h1
              className="font-serif animate-fade-in-up"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: '#1C1917', lineHeight: 1.12, marginBottom: '1rem' }}
            >
              Master{' '}
              <span style={{
                background: 'linear-gradient(135deg, #2E5A44 0%, #4A8C6A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                High-Scale
              </span>{' '}
              Distributed Systems
            </h1>
            <p className="animate-fade-in-up delay-100" style={{ fontSize: '1rem', color: '#57534E', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              Author-signed engineering publications for software architects, staff engineers, and tech leads.
              Distilled production architectures, vector diagrams, and instant in-browser reading.
            </p>

            {/* Feature pills row */}
            <div className="animate-fade-in-up delay-200" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {[
                { icon: <BookOpen size={13} />, label: 'Interactive Web Reader', color: '#2E5A44', bg: '#E8F2EC' },
                { icon: <FileText size={13} />, label: 'Authentic Vector PDFs',  color: '#B45309', bg: '#FEF3C7' },
                { icon: <ShieldCheck size={13} />, label: '100% DRM-Free',        color: '#7E22CE', bg: '#F3E8FF' },
                { icon: <Zap size={13} />, label: 'Free Sample Chapters',        color: '#0369A1', bg: '#E0F2FE' },
              ].map((pill, i) => (
                <span key={i} className="feature-pill" style={{ color: pill.color, backgroundColor: pill.bg, borderColor: pill.bg }}>
                  {pill.icon} {pill.label}
                </span>
              ))}
            </div>

            {/* Featured book CTA */}
            {featuredBook && (
              <div className="animate-fade-in-up delay-300" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#78716C', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                    Featured Masterclass
                  </span>
                  <span className="font-serif hero-price" style={{ fontSize: '2rem', fontWeight: 800, color: '#2E5A44' }}>
                    ₹{featuredBook.price}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} className="btn-group-mobile">
                  <button
                    className={`btn btn-green ${!user ? 'pulse-glow' : ''}`}
                    onClick={() => {
                      if (!user) { handleGuestPrompt('Sign in to preview free chapters.'); return; }
                      setActiveBookForReader(featuredBook);
                      setReaderIsSample(true);
                    }}
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                  >
                    {user ? <Eye size={16} /> : <Lock size={15} />}
                    {user ? 'Read Free Sample' : 'Sign In to Preview'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (!user) { handleGuestPrompt('Sign in to add books to your cart.'); return; }
                      setActiveBookForDetails(featuredBook);
                    }}
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
                  >
                    <BookOpen size={16} /> View Details
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: 3D Floating Book */}
          {featuredBook && (
            <div
              className="hero-book-showcase animate-float"
              onClick={() => {
                if (!user) { handleGuestPrompt('Sign in to preview book details.'); return; }
                setActiveBookForDetails(featuredBook);
              }}
              style={{ cursor: 'pointer', zIndex: 1, flexShrink: 0 }}
              title={user ? `Click to preview ${featuredBook.title}` : 'Sign in to preview'}
            >
              <div className="book-3d-wrap">
                <div
                  className="book-3d"
                  style={{
                    width: '175px',
                    height: '235px',
                    background: featuredBook.coverGradient || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: '#FFFFFF',
                    padding: '1.4rem 1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', opacity: 0.9 }}>{featuredBook.tag}</span>
                      <span style={{ fontSize: '0.58rem', backgroundColor: 'rgba(255,255,255,0.18)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>2026</span>
                    </div>
                    <h3 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2, margin: 0, color: '#FFF' }}>
                      {featuredBook.title}
                    </h3>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', opacity: 0.85, margin: '0 0 0.3rem 0' }}>{featuredBook.author}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: '#FDE68A' }}>
                      <Star size={10} fill="#FDE68A" /> {featuredBook.rating || 4.9}
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '0.7rem', fontWeight: 600, textAlign: 'center' }}>
                {user ? '↑ Click to explore' : '🔒 Sign in to preview'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── GUEST WELCOME BANNER ──────────────────────────────────────── */}
      {!user && (
        <div
          className="guest-banner hover-elevate animate-fade-in-up delay-200"
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 60%, #FDE68A 100%)',
            border: '1px solid #FDE68A',
            borderRadius: '18px',
            padding: '1.4rem 1.75rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            boxShadow: '0 6px 24px rgba(217, 119, 6, 0.1)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 280px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
              color: '#92400E',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#78350F' }}>
                First time at Sefali's Library?
              </h4>
              <p style={{ fontSize: '0.83rem', color: '#92400E', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                <strong>Free account in 15 seconds</strong> — unlock sample chapters, synopses, table of contents &amp; in-browser reading.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexShrink: 0 }} className="btn-group-mobile mobile-full">
            <button className="btn btn-secondary" onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', backgroundColor: '#FFF' }}>
              Sign In
            </button>
            <button className="btn btn-green pulse-glow" onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true); }}
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
              Create Free Account →
            </button>
          </div>
        </div>
      )}

      {/* ── ANIMATED STATS BAR ───────────────────────────────────────── */}
      <div
        ref={statsRef}
        className="animate-fade-in-up stats-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.25rem 2rem',
          marginBottom: '3rem',
          boxShadow: 'var(--shadow-subtle)',
          flexWrap: 'wrap',
        }}
      >
        {[
          { value: readersCount.toLocaleString() + '+', label: 'Engineers Reading', icon: <Users size={18} style={{ color: '#2E5A44' }} /> },
          { value: booksCount + '+', label: 'Masterclasses Published', icon: <BookMarked size={18} style={{ color: '#2E5A44' }} /> },
          { value: `${(ratingCount / 10).toFixed(1)}/5`, label: 'Average Rating', icon: <Star size={18} style={{ color: '#D97706' }} /> },
          { value: '100%', label: 'DRM-Free Access', icon: <ShieldCheck size={18} style={{ color: '#2E5A44' }} /> },
        ].map((stat, i) => (
          <React.Fragment key={i}>
            <div
              className="stat-card"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0.5rem 2.5rem',
                textAlign: 'center',
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                {stat.icon}
                <span className="font-serif" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1C1917' }}>
                  {stat.value}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 600 }}>{stat.label}</span>
            </div>
            {i < 3 && (
              <div className="stat-divider" style={{ width: '1px', height: '40px', backgroundColor: '#E7E3D4', flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── TICKER STRIP ─────────────────────────────────────────────── */}
      <div className="ticker-wrap" style={{ marginBottom: '3rem', padding: '0.75rem 0', borderTop: '1px solid #EAE3CF', borderBottom: '1px solid #EAE3CF' }}>
        <div className="marquee-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{
              padding: '0 2.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#78716C',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── THREE VALUE PILLARS ──────────────────────────────────────── */}
      <div
        className="feature-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem',
        }}
      >
        {[
          {
            icon: <BookOpen size={24} />,
            iconBg: 'linear-gradient(135deg, #E8F2EC 0%, #C6E0D0 100%)',
            iconColor: '#2E5A44',
            title: 'Interactive Web Reader',
            desc: 'Read smoothly in any browser. Toggle Dark, Obsidian, Sepia & Editorial Light modes with adjustable typography and instant chapter sync.',
            badge: 'In-Browser',
            delay: 'delay-100',
          },
          {
            icon: <FileText size={24} />,
            iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            iconColor: '#B45309',
            title: 'Authentic Vector PDFs',
            desc: 'Download complete uncompressed PDFs with high-fidelity architectural schematics, sequence diagrams, and syntax-highlighted code samples.',
            badge: 'High-Fidelity',
            delay: 'delay-200',
          },
          {
            icon: <Award size={24} />,
            iconBg: 'linear-gradient(135deg, #F3E8FF 0%, #DDD6FE 100%)',
            iconColor: '#7E22CE',
            title: 'Try Every Chapter First',
            desc: 'Registered users read introductory sample chapters for every release before buying — zero commitment, full technical depth, every time.',
            badge: 'Free Preview',
            delay: 'delay-300',
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`card hover-elevate animate-fade-in-up ${card.delay}`}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E3D4',
              borderRadius: '18px',
              padding: '1.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top right accent */}
            <div style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              fontSize: '0.65rem', fontWeight: 700, color: '#78716C',
              backgroundColor: '#F5F5F4', padding: '0.2rem 0.55rem',
              borderRadius: '20px', letterSpacing: '0.04em',
            }}>
              {card.badge}
            </div>
            <div style={{
              width: '50px', height: '50px', borderRadius: '14px',
              background: card.iconBg,
              color: card.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              {card.icon}
            </div>
            <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              {card.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#57534E', lineHeight: 1.55, margin: 0 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── CATALOG SECTION ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom: '0.4rem' }}>
              Book Catalog
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              Browse All Masterclasses
            </h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#78716C' }}>
            {filteredBooks.length} title{filteredBooks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {/* Category Pills */}
          <div className="filter-pills" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  border: selectedTag === tag ? '1px solid #2E5A44' : '1px solid #E7E3D4',
                  backgroundColor: selectedTag === tag ? '#2E5A44' : '#FFFFFF',
                  color: selectedTag === tag ? '#FFFFFF' : '#57534E',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '24px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {tag !== 'ALL' && tagIcons[tag]}
                {tag === 'ALL' ? 'All Handbooks' : tag}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="search-sort-row" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
              <input
                type="text"
                placeholder="Search topic, author…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.1rem', height: '38px', fontSize: '0.82rem', borderRadius: '20px', width: '210px' }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto', height: '38px', fontSize: '0.82rem', borderRadius: '20px', paddingRight: '1.75rem' }}
            >
              <option value="featured">Featured First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── BOOK CARDS GRID ──────────────────────────────────────────── */}
      <div
        className="catalog-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.75rem',
          marginBottom: '4rem',
        }}
      >
        {filteredBooks.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', color: '#78716C' }}>
            <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No books match your search.</p>
          </div>
        ) : (
          filteredBooks.map((book, idx) => {
            const owned = isPurchased(book);
            const isHovered = hoveredBook === book._id;
            const isVisible = visibleCards.has(idx);
            return (
              <div
                key={book._id || book.title}
                ref={el => cardRefs.current[idx] = el}
                onMouseEnter={() => setHoveredBook(book._id || null)}
                onMouseLeave={() => setHoveredBook(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  backgroundColor: '#FFFFFF',
                  border: isHovered ? '1px solid #B8B2A0' : '1px solid #E7E3D4',
                  borderRadius: '18px',
                  position: 'relative',
                  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.25s ease',
                  transform: isHovered ? 'translateY(-7px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 22px 44px -8px rgba(0,0,0,0.14)' : 'var(--shadow-subtle)',
                  opacity: isVisible ? 1 : 0,
                  animation: isVisible ? `fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 0.06}s both` : 'none',
                }}
              >
                {/* Featured badge */}
                {book.featured && (
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    backgroundColor: '#FDE68A', color: '#78350F',
                    fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.5rem',
                    borderRadius: '4px', letterSpacing: '0.06em',
                  }}>
                    ★ STAFF PICK
                  </div>
                )}

                {/* Clickable 3D book cover */}
                <div
                  onClick={() => {
                    if (!user) { handleGuestPrompt('Sign in to preview book details and sample chapters.'); return; }
                    setActiveBookForDetails(book);
                  }}
                  style={{ cursor: 'pointer' }}
                  title={user ? `Preview ${book.title}` : 'Sign in to preview'}
                >
                  <div className="book-3d-wrap" style={{ width: '100%', marginBottom: '1.1rem' }}>
                    <div
                      className="book-3d"
                      style={{
                        width: '100%', height: '168px',
                        background: book.coverGradient || 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                        color: '#FFFFFF',
                        padding: '1.2rem',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        borderRadius: '8px 12px 12px 8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', fontWeight: 700, opacity: 0.85, maxWidth: '70%', lineHeight: 1.2 }}>
                          {book.tag}
                        </span>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.2rem',
                          fontSize: '0.72rem', backgroundColor: 'rgba(0,0,0,0.3)',
                          padding: '0.15rem 0.4rem', borderRadius: '4px',
                        }}>
                          <Star size={11} fill="#FBBF24" color="#FBBF24" /> {book.rating || 4.9}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2, margin: 0, color: '#FFF' }}>
                          {book.title}
                        </h3>
                        {!user && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            marginTop: '0.4rem', fontSize: '0.62rem', color: '#FDE68A',
                            backgroundColor: 'rgba(0,0,0,0.4)', padding: '0.15rem 0.45rem', borderRadius: '4px',
                          }}>
                            <Lock size={9} /> Sign in to preview
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.2rem' }}>
                    {book.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '0.45rem' }}>
                    By {book.author} · {book.pageCount || 180} pages
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#57534E', lineHeight: 1.45, marginBottom: '0.7rem' }}>
                    {book.synopsis ? book.synopsis.slice(0, 88) + '…' : ''}
                  </p>
                </div>

                {/* Action footer */}
                <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #F5F5F4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2E5A44' }}>₹{book.price}</span>
                    {owned ? (
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle size={12} /> Owned
                      </span>
                    ) : user ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => addToCart(book)}
                          title="Add to Cart"
                          style={{
                            backgroundColor: '#E8F2EC', color: '#2E5A44', border: 'none',
                            borderRadius: '8px', padding: '0.48rem 0.6rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#C6E0D0')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#E8F2EC')}
                        >
                          <ShoppingCart size={15} />
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => setCheckoutBook(book)}
                          style={{ padding: '0.48rem 1rem', fontSize: '0.8rem' }}
                        >
                          Buy Now
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleGuestPrompt('Sign in to preview, add to cart, or purchase.')}
                        style={{ padding: '0.48rem 0.9rem', fontSize: '0.75rem', gap: '0.3rem', backgroundColor: '#F5F5F4' }}
                      >
                        <Lock size={12} /> Sign In
                      </button>
                    )}
                  </div>

                  {/* Quick-read link for logged-in purchased or sample */}
                  {user && (
                    <button
                      onClick={() => {
                        if (owned) {
                          setActiveBookForReader(book);
                          setReaderIsSample(false);
                        } else {
                          setActiveBookForReader(book);
                          setReaderIsSample(true);
                        }
                      }}
                      style={{
                        marginTop: '0.6rem',
                        background: 'none', border: 'none',
                        color: '#2E5A44', fontSize: '0.78rem', fontWeight: 600,
                        cursor: 'pointer', padding: 0,
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        transition: 'opacity 0.2s',
                        opacity: isHovered ? 1 : 0,
                        width: '100%',
                      }}
                    >
                      <Eye size={13} />
                      {owned ? 'Continue Reading →' : 'Read Free Sample →'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#FFFFFF', border: '1px solid #E7E3D4', borderRadius: '22px',
        padding: 'clamp(1.75rem, 4vw, 2.75rem)', marginBottom: '3.5rem',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
            Engineer Endorsements
          </div>
          <h3 className="font-serif" style={{ fontSize: 'clamp(1.35rem, 3vw, 1.85rem)', fontWeight: 700, color: '#1C1917' }}>
            What Senior Builders Are Saying
          </h3>
        </div>

        <div className="testimonial-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}>
          {[
            {
              quote: '"The breakdown of distributed circuit breakers and client memory caching saved our production web client during peak deployment."',
              name: 'Priya Sharma',
              title: 'Staff Infrastructure Architect',
              avatar: 'PS',
              color: '#2E5A44',
              bg: '#E8F2EC',
            },
            {
              quote: '"Finally, technical books that skip the filler. Extremely dense architectural insight paired with practical microservice blueprints."',
              name: 'Vikram Seth',
              title: 'Principal Systems Engineer',
              avatar: 'VS',
              color: '#7E22CE',
              bg: '#F3E8FF',
            },
            {
              quote: '"The vector PDFs look glorious on an iPad, and the in-browser reader with Sepia mode is a masterclass in editorial UX design."',
              name: 'Ananya Iyer',
              title: 'Frontend Tech Lead',
              avatar: 'AI',
              color: '#B45309',
              bg: '#FEF3C7',
            },
          ].map((t, i) => (
            <div
              key={i}
              className="hover-elevate animate-fade-in-up"
              style={{
                backgroundColor: '#FAF7EE', padding: '1.5rem', borderRadius: '14px',
                border: '1px solid #EAE3CF',
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <div style={{ display: 'flex', gap: '0.2rem', color: '#D97706', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#D97706" />)}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#44403C', fontStyle: 'italic', lineHeight: 1.55, marginBottom: '1rem' }}>
                {t.quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: t.bg, color: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.75rem',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#78716C', margin: 0 }}>{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA BANNER ────────────────────────────────────────── */}
      {!user && (
        <div className="bottom-cta-banner" style={{
          background: 'linear-gradient(135deg, #1C1917 0%, #292524 60%, #3D2F28 100%)',
          color: '#FFFFFF',
          borderRadius: '22px',
          padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative gradient blob */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-40px',
            width: '260px', height: '260px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,90,68,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-50px', left: '-30px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,224,128,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FDE68A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Join 1,200+ Engineering Leaders
          </span>
          <h2
            className="font-serif cta-title"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0.6rem 0 0.85rem 0', color: '#FFF', lineHeight: 1.2 }}
          >
            Ready to Master High-Scale<br />Distributed Systems?
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#D6D3D1', maxWidth: '560px', margin: '0 auto 2rem auto', lineHeight: 1.65 }}>
            Create your free account in 15 seconds — unlock introductory sample chapters,
            explore architectural diagrams, and build your digital bookshelf today.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }} className="btn-group-mobile">
            <button
              className="btn btn-green pulse-glow"
              onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true); }}
              style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', fontWeight: 700 }}
            >
              <Sparkles size={18} /> Get Free Access — 15 Seconds
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}
              style={{ padding: '0.9rem 1.85rem', fontSize: '1rem', backgroundColor: 'transparent', color: '#FFF', borderColor: '#57534E' }}
            >
              Sign In to Existing Account
            </button>
          </div>

          {/* Bottom trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[
              { icon: <ShieldCheck size={14} />, label: 'DRM-Free' },
              { icon: <Zap size={14} />, label: 'Instant Access' },
              { icon: <Coffee size={14} />, label: 'No Credit Card' },
              { icon: <Star size={14} />, label: '4.9/5 Rated' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#A8A29E', fontWeight: 600 }}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
