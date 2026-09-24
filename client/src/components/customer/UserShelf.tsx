import React from 'react';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import { BookOpen, CheckCircle, Clock, PlayCircle, Download, FileText, Sparkles } from 'lucide-react';
import { getBookDownloadUrl } from '../../services/api';

export const UserShelf: React.FC = () => {
  const {
    books,
    user,
    setActiveTab,
    setActiveBookForReader,
    setReaderIsSample,
    setAuthModalOpen,
    addToast
  } = useApp();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#E8F2EC',
          color: '#2E5A44',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <BookOpen size={32} />
        </div>
        <h2 className="font-serif" style={{ fontSize: '2rem', color: '#1C1917', marginBottom: '0.5rem', fontWeight: 700 }}>
          Your Digital Library Awaits
        </h2>
        <p style={{ color: '#57534E', marginBottom: '1.75rem', maxWidth: '460px', margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
          Sign in to access your unlocked engineering masterclasses, reading bookmarks, and multi-device reading sync.
        </p>
        <button className="btn btn-green" onClick={() => setAuthModalOpen(true)} style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}>
          Sign In to Open Shelf
        </button>
      </div>
    );
  }

  // Get user's purchased books
  const userBookList: Book[] = books.filter(b => {
    if (!user.purchasedBooks) return false;
    return user.purchasedBooks.some((p: any) =>
      typeof p === 'string' ? (p === b._id || p === b.title) : (p._id === b._id || p.title === b.title)
    );
  });

  const getProgress = (bookId: string, title: string) => {
    const prog = user.readingProgress?.find(p => p.bookId === bookId || p.bookId === title);
    if (prog) return prog;
    return { percentage: 0, chapterNumber: 1, completed: false };
  };

  const handleDownloadCopy = (book: Book, format: 'EPUB' | 'PDF') => {
    if (book.ebookFile) {
      window.open(getBookDownloadUrl(book), '_blank');
      addToast('success', `Downloading genuine e-book file: "${book.title}"`);
      return;
    }

    const sampleText = `
====================================================
  SEFALI'S LIBRARY EDITORIAL - ${book.title}
  Author: ${book.author} | Format: ${format}
====================================================

SYNOPSIS:
${book.synopsis}

CHAPTER 1: ${book.sampleChapter?.title || 'Introduction'}
${book.sampleChapter?.content || 'Content text...'}

====================================================
Licensed to: ${user.name} (${user.email})
Checksum: ${Math.random().toString(36).substring(2, 12).toUpperCase()}
====================================================
    `;
    const element = document.createElement('a');
    const file = new Blob([sampleText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${book.title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('success', `Downloaded "${book.title}" (${format})`);
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E5A44', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          PERSONAL DIGITAL SHELF
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, marginTop: '0.2rem', color: '#1C1917' }}>
          My Library & Reading Progress
        </h1>
      </div>

      <div className="shelf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Left Column: My Library List */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #E7E3D4',
            marginBottom: '1.5rem'
          }}>
            <h2 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
              My Unlocked Publications ({userBookList.length})
            </h2>
            <span className="badge badge-green">
              Active Reader Account
            </span>
          </div>

          {/* Book List Items */}
          {userBookList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#78716C' }}>
              <p style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Your digital shelf has no purchased books yet.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('storefront')}>
                Explore Storefront Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {userBookList.map(book => {
                const prog = getProgress(book._id, book.title);

                return (
                  <div
                    key={book._id || book.title}
                    className="shelf-item-card"
                    style={{
                      backgroundColor: '#FAF7EE',
                      border: '1px solid #E7E3D4',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                      {/* Thumbnail Cover */}
                      <div style={{
                        width: '60px',
                        height: '76px',
                        borderRadius: '8px',
                        background: book.coverGradient || 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                        color: '#FFFFFF',
                        padding: '0.65rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
                      }}>
                        <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {book.tag}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.1 }}>
                          {book.title}
                        </span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.25rem' }}>
                          {book.title}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: '#57534E', marginBottom: '0.6rem' }}>
                          <span style={{ fontWeight: 600, color: prog.completed ? '#2E5A44' : '#1C1917' }}>
                            {prog.completed ? '100% Completed' : `${prog.percentage}% Completed • Chapter ${prog.chapterNumber}`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                          width: '100%',
                          height: '7px',
                          backgroundColor: '#EAE6D8',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.max(prog.percentage, 5)}%`,
                            height: '100%',
                            backgroundColor: '#2E5A44',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shelf-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDownloadCopy(book, 'EPUB')}
                        title="Download EPUB file"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <Download size={14} /> EPUB
                      </button>

                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setActiveBookForReader(book);
                          setReaderIsSample(false);
                        }}
                        style={{
                          padding: '0.55rem 1.25rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        <BookOpen size={16} /> {prog.completed ? 'Re-read' : 'Continue Reading'}
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
          
          <div className="card" style={{ backgroundColor: '#FAF7EE', border: '1px solid #E7E3D4' }}>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1C1917' }}>
              Reading Progress Sync
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              Your current reading positions, bookmarks, and font preferences sync automatically to your account.
            </p>
          </div>

          <div className="card" style={{ backgroundColor: '#FFF', border: '1px solid #E7E3D4' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#57534E', marginBottom: '0.75rem' }}>
              Offline File Downloads
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              Use the EPUB download button on any book card to store an offline copy on your Kindle, Boox, Kobo, or tablet.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
