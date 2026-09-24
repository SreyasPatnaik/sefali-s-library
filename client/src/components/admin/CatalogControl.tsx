import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import { Search, Plus, Edit, Trash2, X, FileText, AlertTriangle, UploadCloud, Download, Loader2, Paperclip } from 'lucide-react';
import { api, getFileUrl } from '../../services/api';

export const CatalogControl: React.FC = () => {
  const { books, setBooks, refreshBooks, refreshAdminStats, addToast, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Delete modal state
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Shefali Jangid');
  const [price, setPrice] = useState('499');
  const [tag, setTag] = useState('SYSTEMS');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [formats, setFormats] = useState<('EPUB' | 'PDF')[]>(['EPUB', 'PDF']);
  const [synopsis, setSynopsis] = useState('');
  const [coverGradient, setCoverGradient] = useState('linear-gradient(135deg, #1e293b 0%, #334155 100%)');
  const [readingMood, setReadingMood] = useState('High Scalability Architecture');
  const [pageCount, setPageCount] = useState('180');

  // File upload state
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [existingFileSize, setExistingFileSize] = useState<number | null>(null);

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor(user?.name || 'Shefali Jangid');
    setPrice('499');
    setTag('SYSTEMS');
    setStatus('Published');
    setFormats(['EPUB', 'PDF']);
    setSynopsis('');
    setCoverGradient('linear-gradient(135deg, #1e293b 0%, #334155 100%)');
    setReadingMood('High Scalability Architecture');
    setPageCount('180');
    setEbookFile(null);
    setExistingFileUrl(null);
    setExistingFileName(null);
    setExistingFileSize(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(book.price.toString());
    setTag(book.tag);
    setStatus(book.status);
    setFormats(book.formats);
    setSynopsis(book.synopsis);
    setCoverGradient(book.coverGradient || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)');
    setReadingMood(book.readingMood || '');
    setPageCount((book.pageCount || '').toString());
    setEbookFile(null);
    setExistingFileUrl(book.ebookFile || null);
    setExistingFileName(book.fileOriginalName || null);
    setExistingFileSize(book.fileSize || null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        addToast('error', 'File size exceeds maximum 50MB limit');
        return;
      }
      setEbookFile(file);
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('error', 'Book title is required');
      return;
    }
    if (!author.trim()) {
      addToast('error', 'Author name is required');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('error', 'Please enter a valid price in INR');
      return;
    }
    if (!synopsis.trim()) {
      addToast('error', 'Book synopsis is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build FormData for multipart upload with optional file attachment
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', author.trim());
      formData.append('price', numPrice.toString());
      formData.append('tag', (tag.trim() || 'SYSTEMS').toUpperCase());
      formData.append('status', status);
      formData.append('formats', JSON.stringify(formats));
      formData.append('synopsis', synopsis.trim());
      formData.append('coverGradient', coverGradient);
      formData.append('readingMood', readingMood.trim() || 'General Engineering');
      formData.append('pageCount', (Number(pageCount) || 180).toString());

      if (ebookFile) {
        formData.append('ebookFile', ebookFile);
      }

      if (editingBook) {
        const updated = await api.updateBook(editingBook._id, formData);
        setBooks(prev => prev.map(b => b._id === updated._id ? updated : b));
        addToast('success', `Updated "${title}" metadata & assets.`);
      } else {
        const created = await api.createBook(formData);
        setBooks(prev => [created, ...prev]);
        addToast('success', `Published "${title}" to active catalog.`);
      }

      await refreshBooks();
      await refreshAdminStats();
      setIsModalOpen(false);
    } catch (err: any) {
      addToast('error', err.message || 'Error saving book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteBook(bookToDelete._id);
      // Immediately remove from local state
      setBooks(prev => prev.filter(b => b._id !== bookToDelete._id));
      addToast('info', `Deleted "${bookToDelete.title}" from catalog.`);
      await refreshBooks();
      await refreshAdminStats();
      setBookToDelete(null);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete book');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E5A44', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ADMINISTRATION CONTROL
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, marginTop: '0.2rem', color: '#1C1917' }}>
          Catalog & Digital Asset Inventory
        </h1>
      </div>

      <div className="responsive-grid-admin" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Main Catalog Table Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          
          {/* Top Search & Add Button Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search catalog titles or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.3rem', height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            <button
              className="btn btn-green"
              onClick={handleOpenAddModal}
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
            >
              <Plus size={16} /> Publish New E-Book
            </button>
          </div>

          {/* Catalog Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E7E3D4', color: '#78716C', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Title</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Tag</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>E-Book Document</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#78716C' }}>
                      No books found in the active catalog.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map(book => (
                    <tr key={book._id || book.title} style={{ borderBottom: '1px solid #FAF7EE', fontSize: '0.9rem', color: '#1C1917' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>
                        <div>
                          {book.title}
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#78716C', fontWeight: 400 }}>By {book.author}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span className="badge" style={{ backgroundColor: '#E8F2EC', color: '#2E5A44', fontSize: '0.725rem' }}>
                          {book.tag}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {book.ebookFile ? (
                          <a
                            href={getFileUrl(book.ebookFile)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#E0F2FE',
                              color: '#0369A1',
                              textDecoration: 'none',
                              maxWidth: '160px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={`Attached file: ${book.fileOriginalName || 'E-Book'} (${book.fileSize ? Math.round(book.fileSize / 1024) + ' KB' : ''})`}
                          >
                            <FileText size={12} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {book.fileOriginalName || 'PDF Document'}
                            </span>
                            <Download size={11} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#A8A29E', fontStyle: 'italic' }}>
                            No file attached
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: '#2E5A44' }}>
                        ₹{book.price}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span className={`badge ${book.status === 'Published' ? 'badge-green' : 'badge-yellow'}`}>
                          {book.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2E5A44', padding: '0.25rem' }}
                            title="Edit Metadata & File"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.25rem' }}
                            title="Delete E-Book"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ backgroundColor: '#FAF7EE', border: '1px solid #E7E3D4' }}>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1C1917' }}>
              Live REST Database Sync
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              All additions, document uploads, and deletions update MongoDB records directly and sync instantly across customer storefronts.
            </p>
          </div>

          <div className="card" style={{ backgroundColor: '#FFF', border: '1px solid #E7E3D4' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#57534E', marginBottom: '0.75rem' }}>
              Digital Asset Attachment
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem', color: '#1C1917' }}>
              <div>• Supported: PDF, EPUB, MOBI, DOCX, TXT</div>
              <div>• Storage: Secure local storage with auto-cleanup</div>
              <div>• Customer download unlocked upon confirmed order</div>
              <div>• Direct preview available in admin table</div>
            </div>
          </div>

        </div>

      </div>

      {/* In-App Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setBookToDelete(null)}>
          <div className="modal-content animate-pop-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                  Delete E-Book
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#57534E', marginTop: '0.35rem', marginBottom: 0, lineHeight: 1.45 }}>
                  Are you sure you want to permanently delete <strong style={{ color: '#1C1917' }}>"{bookToDelete.title}"</strong> from the catalog?
                </p>
              </div>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#78716C', backgroundColor: '#F5F5F4', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              This will remove the book listing, delete any attached PDF/EPUB document from storage, and update all customer storefront views immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={isDeleting}
                onClick={() => setBookToDelete(null)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteBook}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Delete E-Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit E-Book Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-content animate-pop-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                {editingBook ? 'Edit E-Book Metadata & Asset' : 'Publish New E-Book'}
              </h3>
              <button
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook}>
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Microservice Resilience Handbook"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Author Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="Author full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (INR ₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 499"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tag Category</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    placeholder="SYSTEMS, CSS TRICKS, PYTHON"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Publication Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reading Mood Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    value={readingMood}
                    onChange={e => setReadingMood(e.target.value)}
                    placeholder="e.g. High Scalability Architecture"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Page Count</label>
                  <input
                    type="number"
                    className="form-input"
                    value={pageCount}
                    onChange={e => setPageCount(e.target.value)}
                    placeholder="e.g. 180"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Synopsis</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={synopsis}
                  onChange={e => setSynopsis(e.target.value)}
                  placeholder="Summary of topics covered, target audience, and architecture takeaways..."
                  required
                />
              </div>

              {/* Attach E-Book Document (PDF / EPUB / DOCX) */}
              <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Paperclip size={14} color="#2E5A44" />
                    <strong>Attach E-Book Document (PDF, EPUB, DOCX)</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 400 }}>Max 50MB</span>
                </label>

                {ebookFile ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#E8F2EC',
                    border: '1px solid #A3D9B1',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                      <FileText size={22} color="#2E5A44" style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1917' }}>{ebookFile.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#57534E' }}>
                          {(ebookFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to attach
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEbookFile(null)}
                      style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer', padding: '0.25rem' }}
                      title="Remove attached file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : existingFileUrl ? (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={22} color="#0284C7" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0369A1' }}>
                          {existingFileName || 'Attached E-Book Document'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#57534E' }}>
                          {existingFileSize ? `${(existingFileSize / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                          <a href={getFileUrl(existingFileUrl)} target="_blank" rel="noopener noreferrer" style={{ color: '#0284C7', textDecoration: 'underline' }}>
                            Preview current file
                          </a>
                        </div>
                      </div>
                    </div>
                    <label style={{
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '6px',
                      color: '#0369A1',
                      fontWeight: 600
                    }}>
                      Replace File
                      <input
                        type="file"
                        accept=".pdf,.epub,.mobi,.doc,.docx,.txt"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.25rem 1rem',
                    border: '2px dashed #CBD5E1',
                    borderRadius: '8px',
                    backgroundColor: '#FAFAF9',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}>
                    <UploadCloud size={24} style={{ color: '#2E5A44', marginBottom: '0.4rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2E5A44' }}>
                      Click to attach PDF or E-Book file
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '0.2rem' }}>
                      Supported formats: PDF, EPUB, MOBI, DOCX, TXT (Max 50MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.epub,.mobi,.doc,.docx,.txt"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-green"
                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Saving E-Book...' : (editingBook ? 'Save Metadata & Assets' : 'Publish New E-Book')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
