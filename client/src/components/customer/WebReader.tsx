import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, ChevronLeft, ChevronRight, Bookmark, List, Download,
  ExternalLink, FileText, BookOpen, Sparkles, ShoppingBag
} from 'lucide-react';
import { getBookPdfUrl, getBookDownloadUrl } from '../../services/api';

export const WebReader: React.FC = () => {
  const {
    activeBookForReader,
    setActiveBookForReader,
    readerIsSample,
    setCheckoutBook,
    updateUserReadingProgress,
    addToast,
    user,
    setAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const book = activeBookForReader;

  // Immediately close reader and prompt auth if user is not logged in
  useEffect(() => {
    if (!user && activeBookForReader) {
      setActiveBookForReader(null);
      setAuthModalTab('login');
      setAuthModalOpen(true);
      addToast('info', 'Please sign in or register to preview or read books.');
    }
  }, [user, activeBookForReader]);

  const isPurchased = user?.purchasedBooks?.some((b: any) =>
    typeof b === 'string' ? b === book?._id || b === book?.title : b?._id === book?._id || b?.title === book?.title
  );

  // If user has not purchased the book, reading is locked to sample preview mode
  const effectiveIsSample = readerIsSample || !isPurchased;

  const [readerViewMode, setReaderViewMode] = useState<'pdf' | 'text'>('pdf');
  const [fontSize, setFontSize] = useState<number>(18);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark' | 'obsidian'>('light');
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [tocOpen, setTocOpen] = useState<boolean>(false);

  useEffect(() => {
    if (activeBookForReader) {
      setReaderViewMode(activeBookForReader.ebookFile ? 'pdf' : 'text');
    }
  }, [activeBookForReader]);

  if (!user || !activeBookForReader || !book) return null;

  const chapterList = effectiveIsSample
    ? [book.sampleChapter || (book.chapters && book.chapters[0]) || {
        chapterNumber: 1,
        title: 'Free Sample Preview',
        subtitle: 'Introduction',
        content: book.synopsis,
        keyTakeaway: 'Sample takeaway note.',
        pageOffset: 12
      }]
    : (book.chapters && book.chapters.length > 0 ? book.chapters : [book.sampleChapter]);

  const currentChapter = chapterList[currentChapterIndex] || chapterList[0];
  const totalPages = book.pageCount || 180;
  const currentPage = Math.min(totalPages, (currentChapter.pageOffset || 12) + currentChapterIndex * 15);
  const percentage = Math.round(((currentChapterIndex + 1) / chapterList.length) * 100);

  const themeStyles = {
    light: {
      bg: '#FAF7EE',
      cardBg: '#FFFFFF',
      text: '#1C1917',
      border: '#E7E3D4',
      calloutBg: '#FFF8DB',
      calloutBorder: '#2E5A44'
    },
    sepia: {
      bg: '#F4ECD8',
      cardBg: '#FBF0D9',
      text: '#433422',
      border: '#E4D6B6',
      calloutBg: '#F3E5C8',
      calloutBorder: '#8C6D38'
    },
    dark: {
      bg: '#141312',
      cardBg: '#1C1A17',
      text: '#E7E5E4',
      border: '#2E2B27',
      calloutBg: '#26231E',
      calloutBorder: '#4ADE80'
    },
    obsidian: {
      bg: '#09090B',
      cardBg: '#121215',
      text: '#F4F4F5',
      border: '#27272A',
      calloutBg: '#18181B',
      calloutBorder: '#60A5FA'
    }
  }[themeMode];

  const handleNextChapter = () => {
    if (currentChapterIndex < chapterList.length - 1) {
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      const nextChapter = chapterList[nextIdx];
      const nextPg = Math.min(totalPages, (nextChapter.pageOffset || 12) + nextIdx * 15);
      const nextPct = Math.round(((nextIdx + 1) / chapterList.length) * 100);
      updateUserReadingProgress(book._id, nextChapter.chapterNumber, nextPg, nextPct);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    addToast(isBookmarked ? 'info' : 'success', isBookmarked ? 'Bookmark removed' : `Bookmarked Chapter ${currentChapter.chapterNumber}`);
  };

  return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(28, 25, 23, 0.75)' }} onClick={() => setActiveBookForReader(null)}>
      
      {/* Full-Screen Web E-Reader Frame */}
      <div
        className="animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95vw',
          maxWidth: '1360px',
          height: '92vh',
          backgroundColor: themeStyles.cardBg,
          color: themeStyles.text,
          borderRadius: '20px',
          border: `1px solid ${themeStyles.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'grid',
          gridTemplateColumns: (tocOpen && readerViewMode === 'text') ? '320px 1fr' : '1fr',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.25s ease'
        }}
      >
        
        {/* Table of Contents Drawer (for Text mode) */}
        {tocOpen && readerViewMode === 'text' && (
          <div style={{
            backgroundColor: themeMode === 'dark' || themeMode === 'obsidian' ? '#181715' : '#FAF7EE',
            borderRight: `1px solid ${themeStyles.border}`,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: themeStyles.text }}>
                Table of Contents
              </h3>
              <button onClick={() => setTocOpen(false)} style={{ background: 'none', border: 'none', color: themeStyles.text, cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {chapterList.map((ch, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setTocOpen(false);
                  }}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: idx === currentChapterIndex ? (themeMode === 'dark' ? '#26231E' : '#E8F2EC') : 'transparent',
                    color: idx === currentChapterIndex ? '#2E5A44' : themeStyles.text,
                    fontWeight: idx === currentChapterIndex ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', opacity: 0.75, textTransform: 'uppercase' }}>
                    Chapter {ch.chapterNumber}
                  </span>
                  <span>{ch.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reader Main Viewpane */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Top Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.75rem',
            borderBottom: `1px solid ${themeStyles.border}`,
            backgroundColor: themeStyles.cardBg,
            flexWrap: 'wrap',
            gap: '0.75rem',
            zIndex: 10
          }}>
            
            {/* Title & View Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2E5A44', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {effectiveIsSample ? 'PREVIEW EDITION' : 'LICENSED DIGITAL EDITION'}
                </span>
                <h4 className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: themeStyles.text }}>
                  {book.title}
                </h4>
              </div>

              {/* View Mode Switcher (PDF vs Formatted Text) */}
              {book.ebookFile && (
                <div style={{
                  display: 'flex',
                  backgroundColor: themeMode === 'dark' || themeMode === 'obsidian' ? '#292524' : '#F5F5F4',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid #E7E3D4'
                }}>
                  <button
                    onClick={() => setReaderViewMode('pdf')}
                    style={{
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: readerViewMode === 'pdf' ? '#2E5A44' : 'transparent',
                      color: readerViewMode === 'pdf' ? '#FFFFFF' : themeStyles.text
                    }}
                  >
                    <FileText size={14} /> PDF Document
                  </button>

                  <button
                    onClick={() => setReaderViewMode('text')}
                    style={{
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: readerViewMode === 'text' ? '#2E5A44' : 'transparent',
                      color: readerViewMode === 'text' ? '#FFFFFF' : themeStyles.text
                    }}
                  >
                    <BookOpen size={14} /> Chapter Text
                  </button>
                </div>
              )}
            </div>

            {/* Reader Controls Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              
              {/* If PDF Mode: Direct Download & Popout Buttons */}
              {readerViewMode === 'pdf' && book.ebookFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isPurchased ? (
                    <>
                      <a
                        href={getBookPdfUrl(book)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem', textDecoration: 'none' }}
                        title="Open PDF in full browser window"
                      >
                        <ExternalLink size={13} /> Full Window
                      </a>

                      <a
                        href={getBookDownloadUrl(book)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-green"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem', textDecoration: 'none' }}
                        title="Download offline copy"
                      >
                        <Download size={13} /> Save Copy
                      </a>
                    </>
                  ) : (
                    <button
                      className="btn btn-green"
                      onClick={() => {
                        setActiveBookForReader(null);
                        setCheckoutBook(book);
                      }}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.775rem', gap: '0.35rem' }}
                      title="Purchase book to unlock full offline PDF download"
                    >
                      <ShoppingBag size={13} /> Buy Full Edition (₹{book.price})
                    </button>
                  )}
                </div>
              )}

              {/* If Text Mode: Font Size & Theme & TOC Controls */}
              {readerViewMode === 'text' && (
                <>
                  <button
                    onClick={() => setTocOpen(!tocOpen)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: themeStyles.text,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <List size={16} />
                    <span>Contents</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: themeMode === 'dark' || themeMode === 'obsidian' ? '#292524' : '#EAE6D8', padding: '3px 8px', borderRadius: '6px' }}>
                    <button
                      onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeStyles.text, fontWeight: 700, fontSize: '0.75rem' }}
                    >
                      A-
                    </button>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>|</span>
                    <button
                      onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeStyles.text, fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      A+
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      onClick={() => setThemeMode('light')}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', border: themeMode === 'light' ? '2px solid #2E5A44' : '1px solid #CCC', backgroundColor: '#FAF7EE', cursor: 'pointer' }}
                      title="Paper White"
                    />
                    <button
                      onClick={() => setThemeMode('sepia')}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', border: themeMode === 'sepia' ? '2px solid #8C6D38' : '1px solid #CCC', backgroundColor: '#F4ECD8', cursor: 'pointer' }}
                      title="Editorial Sepia"
                    />
                    <button
                      onClick={() => setThemeMode('dark')}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', border: themeMode === 'dark' ? '2px solid #4ADE80' : '1px solid #CCC', backgroundColor: '#141312', cursor: 'pointer' }}
                      title="Night Dark"
                    />
                    <button
                      onClick={() => setThemeMode('obsidian')}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', border: themeMode === 'obsidian' ? '2px solid #60A5FA' : '1px solid #CCC', backgroundColor: '#09090B', cursor: 'pointer' }}
                      title="Obsidian Dark"
                    />
                  </div>

                  <button
                    onClick={handleToggleBookmark}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? '#2E5A44' : themeStyles.text }}
                    title="Bookmark Page"
                  >
                    <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </>
              )}

              {/* Close Reader Button */}
              <button
                onClick={() => setActiveBookForReader(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: themeStyles.text,
                  padding: '0.3rem',
                  borderRadius: '50%',
                  display: 'flex'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Sample Mode Banner */}
          {effectiveIsSample && (
            <div style={{
              backgroundColor: '#FFFBEB',
              borderBottom: '1px solid #FDE68A',
              padding: '0.65rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#92400E'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} />
                <span>
                  <strong>Sample Reading Preview:</strong> You are viewing an introductory excerpt. Purchase to unlock complete offline download and DRM-free lifetime access.
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveBookForReader(null);
                  setCheckoutBook(book);
                }}
                className="btn btn-green"
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                Buy Now (₹{book.price})
              </button>
            </div>
          )}

          {/* Reader Body: Conditional PDF vs Chapter Text Mode */}
          {readerViewMode === 'pdf' && book.ebookFile ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#2B2B2B' }}>
              <iframe
                src={`${getBookPdfUrl(book)}#toolbar=1&navpanes=1&scrollbar=1`}
                title={`${book.title} PDF Document`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  flex: 1,
                  display: 'block'
                }}
              />
            </div>
          ) : (
            <div style={{
              flex: 1,
              padding: '3rem 4rem',
              overflowY: 'auto',
              fontSize: `${fontSize}px`,
              lineHeight: 1.8,
              fontFamily: 'var(--font-serif)'
            }}>
              {!book.ebookFile && (
                <div style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  fontSize: '0.85rem',
                  color: '#1E40AF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <BookOpen size={16} />
                  <span>
                    Viewing editorial formatted chapter text. (Administrators can attach authentic PDF/EPUB documents in the Admin Catalog).
                  </span>
                </div>
              )}

              <h2 className="font-serif" style={{ fontSize: `${fontSize * 1.5}px`, fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.25 }}>
                "{currentChapter.title}"
              </h2>
              {currentChapter.subtitle && (
                <p style={{ fontSize: `${fontSize * 0.9}px`, color: '#78716C', fontStyle: 'italic', marginBottom: '2rem' }}>
                  {currentChapter.subtitle}
                </p>
              )}

              <p style={{ marginBottom: '1.75rem', whiteSpace: 'pre-line' }}>
                {currentChapter.content}
              </p>

              {/* Key Takeaway Callout Box */}
              {currentChapter.keyTakeaway && (
                <div style={{
                  backgroundColor: themeStyles.calloutBg,
                  borderLeft: `4px solid ${themeStyles.calloutBorder}`,
                  padding: '1.25rem 1.5rem',
                  borderRadius: '8px',
                  margin: '2rem 0',
                  fontSize: `${fontSize * 0.9}px`,
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-sans)',
                  color: themeStyles.text
                }}>
                  <strong style={{ fontStyle: 'normal', color: themeStyles.calloutBorder }}>Key Takeaway:</strong> {currentChapter.keyTakeaway}
                </div>
              )}
            </div>
          )}

          {/* Bottom Reader Footer Bar (in Text mode, or PDF status in PDF mode) */}
          {readerViewMode === 'text' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 2rem',
              borderTop: `1px solid ${themeStyles.border}`,
              fontSize: '0.85rem',
              color: themeStyles.text,
              backgroundColor: themeStyles.cardBg
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handlePrevChapter}
                  disabled={currentChapterIndex === 0}
                  style={{ background: 'none', border: 'none', cursor: currentChapterIndex === 0 ? 'not-allowed' : 'pointer', color: themeStyles.text, opacity: currentChapterIndex === 0 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex >= chapterList.length - 1}
                  style={{ background: 'none', border: 'none', cursor: currentChapterIndex >= chapterList.length - 1 ? 'not-allowed' : 'pointer', color: themeStyles.text, opacity: currentChapterIndex >= chapterList.length - 1 ? 0.4 : 1 }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div style={{ flex: 1, maxWidth: '300px', margin: '0 2rem' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: themeMode === 'dark' || themeMode === 'obsidian' ? '#292524' : '#EAE6D8',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#2E5A44',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>

              <div style={{ fontWeight: 700 }}>
                {percentage}% Complete
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 2rem',
              borderTop: `1px solid ${themeStyles.border}`,
              fontSize: '0.825rem',
              color: themeStyles.text,
              backgroundColor: themeStyles.cardBg
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2E5A44', fontWeight: 600 }}>
                <FileText size={15} /> Authentic E-Book Document: {book.fileOriginalName || 'Complete Book PDF'}
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                Interactive Browser PDF Engine • Multi-Device Responsive
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
