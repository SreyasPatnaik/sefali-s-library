import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Search, Plus, Edit, Trash2, X, AlertTriangle, Loader2,
  Image as ImageIcon, Upload, Camera, RefreshCw, CheckCircle2, Eye
} from 'lucide-react';
import { api } from '../../services/api';

export const CatalogControl: React.FC = () => {
  const { books, setBooks, refreshBooks, refreshAdminStats, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Handmade & Sculptures');
  const [price, setPrice] = useState('4500');
  const [originalPrice, setOriginalPrice] = useState('5500');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [synopsis, setSynopsis] = useState('');
  const [materials, setMaterials] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [coverImage, setCoverImage] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');

  // File upload state for image
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (b.tag && b.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory('Handmade & Sculptures');
    setPrice('4500');
    setOriginalPrice('5500');
    setStatus('Published');
    setSynopsis('');
    setMaterials('Hand-glazed ceramic / raw linen / solid wood');
    setDimensions('18cm x 12cm x 24cm');
    setStockQuantity('8');
    setCoverImage('');
    setImagePreviewUrl('');
    setSelectedImageFile(null);
    setImageMode('upload');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setCategory(prod.category || prod.tag || 'Handmade & Sculptures');
    setPrice(prod.price.toString());
    setOriginalPrice((prod.originalPrice || prod.price).toString());
    setStatus(prod.status);
    setSynopsis(prod.synopsis || prod.description || '');
    setMaterials(prod.materials || '');
    setDimensions(prod.dimensions || '');
    setStockQuantity((prod.stockQuantity || 10).toString());
    const existingImg = prod.coverImage || prod.images?.[0] || '';
    setCoverImage(existingImg);
    setImagePreviewUrl(existingImg);
    setSelectedImageFile(null);
    setImageMode(existingImg ? 'upload' : 'upload');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setSelectedImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);

    // Upload immediately to server so we have a permanent URL
    setIsUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      setCoverImage(res.imageUrl);
      setImagePreviewUrl(res.imageUrl);
      addToast('success', 'Picture uploaded and saved to studio media store!');
    } catch (err: any) {
      console.warn('Direct upload warning, will embed on save:', err.message);
      // We still keep the selected file to send in multipart formData on save
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('error', 'Product title is required');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('error', 'Please enter a valid price in INR');
      return;
    }
    if (!synopsis.trim()) {
      addToast('error', 'Product description/story is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', 'THE SHEFALIS SPACE');
      formData.append('price', numPrice.toString());
      formData.append('originalPrice', (Number(originalPrice) || numPrice).toString());
      formData.append('tag', category.toUpperCase());
      formData.append('category', category);
      formData.append('status', status);
      formData.append('synopsis', synopsis.trim());
      formData.append('description', synopsis.trim());
      formData.append('materials', materials.trim());
      formData.append('dimensions', dimensions.trim());
      formData.append('stockQuantity', (Number(stockQuantity) || 10).toString());
      formData.append('inStock', (Number(stockQuantity) > 0).toString());

      if (coverImage.trim()) {
        formData.append('coverImage', coverImage.trim());
        formData.append('image', coverImage.trim());
        formData.append('images', JSON.stringify([coverImage.trim()]));
      }

      if (selectedImageFile) {
        formData.append('ebookFile', selectedImageFile);
      }

      if (editingProduct) {
        const updated = await api.updateBook(editingProduct._id, formData);
        setBooks(prev => prev.map(b => b._id === updated._id ? updated : b));
        addToast('success', `Updated "${title}" studio piece.`);
      } else {
        const created = await api.createBook(formData);
        setBooks(prev => [created, ...prev]);
        addToast('success', `Published "${title}" to studio collection.`);
      }

      await refreshBooks();
      await refreshAdminStats();
      setIsModalOpen(false);
    } catch (err: any) {
      addToast('error', err.message || 'Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteBook(productToDelete._id);
      setBooks(prev => prev.filter(b => b._id !== productToDelete._id));
      addToast('info', `Deleted "${productToDelete.title}" from catalog.`);
      await refreshBooks();
      await refreshAdminStats();
      setProductToDelete(null);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Title Bar */}
      <div style={{
        marginBottom: '2rem',
        borderBottom: '1px solid #EAE5D5',
        paddingBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A08020', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            ADMIN PORTAL • INVENTORY CONTROL
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, marginTop: '0.2rem', color: '#1C1917', lineHeight: 1.2 }}>
            Studio Collection & Inventory
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => refreshBooks()}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
            title="Reload catalog from database"
          >
            <RefreshCw size={15} /> Refresh Data
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOpenAddModal}
            style={{ fontSize: '0.85rem', padding: '0.65rem 1.35rem' }}
          >
            <Plus size={16} /> Publish New Piece
          </button>
        </div>
      </div>

      <div className="responsive-grid-admin" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.75rem' }}>
        
        {/* Main Catalog Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D5',
          borderRadius: '16px',
          padding: 'clamp(0.85rem, 3vw, 1.5rem)',
          boxShadow: 'var(--shadow-subtle)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: '1 1 220px', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search pieces, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '0.82rem', color: '#78716C', fontWeight: 600 }}>
              {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} total
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="desktop-catalog-table" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EAE5D5', color: '#78716C', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Piece</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#78716C' }}>
                      No pieces found in the active studio catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => (
                    <tr key={prod._id} style={{ borderBottom: '1px solid #FAF7EE', fontSize: '0.9rem', color: '#1C1917' }}>
                      <td style={{ padding: '0.9rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={prod.coverImage || prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=150'}
                            alt={prod.title}
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #EAE5D5' }}
                          />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1C1917' }}>{prod.title}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#8C827A' }}>{prod.dimensions || prod.materials || 'Handcrafted Studio Piece'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1C1917', backgroundColor: '#FAF7EE', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #EAE5D5' }}>
                          {prod.category || prod.tag}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 0.5rem', fontWeight: 700, color: '#1C1917' }}>
                        ₹{prod.price}
                      </td>
                      <td style={{ padding: '0.9rem 0.5rem', fontSize: '0.85rem' }}>
                        {prod.stockQuantity ?? 10} units
                      </td>
                      <td style={{ padding: '0.9rem 0.5rem' }}>
                        <span className={`badge ${prod.status === 'Published' ? 'badge-green' : 'badge-yellow'}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1C1917', padding: '0.4rem', borderRadius: '6px' }}
                            title="Edit Piece"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setProductToDelete(prod)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.4rem', borderRadius: '6px' }}
                            title="Delete Piece"
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

          {/* Mobile Card View (shown on phones with full-width, non-cutoff action buttons) */}
          <div className="mobile-catalog-cards" style={{ display: 'none', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {filteredProducts.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#78716C' }}>
                No pieces found.
              </div>
            ) : (
              filteredProducts.map(prod => (
                <div
                  key={prod._id}
                  style={{
                    backgroundColor: '#FAF7EE',
                    border: '1px solid #EAE5D5',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', width: '100%' }}>
                    <img
                      src={prod.coverImage || prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=150'}
                      alt={prod.title}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #EAE5D5', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1C1917', lineHeight: 1.3, wordBreak: 'break-word' }}>
                        {prod.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#1C1917', fontSize: '0.9rem' }}>₹{prod.price}</span>
                        <span className={`badge ${prod.status === 'Published' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                          {prod.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '0.2rem' }}>
                        Stock: {prod.stockQuantity ?? 10} • {prod.category || prod.tag}
                      </div>
                    </div>
                  </div>

                  {/* High-visibility full-width Mobile Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%', borderTop: '1px solid #EAE5D5', paddingTop: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(prod)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#1C1917',
                        border: '1px solid #D6D3CA',
                        borderRadius: '6px',
                        padding: '0.55rem 0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        width: '100%'
                      }}
                    >
                      <Edit size={14} />
                      <span>Edit Piece</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(prod)}
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        padding: '0.55rem 0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        width: '100%'
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card" style={{ backgroundColor: '#FAF7EE', border: '1px solid #EAE5D5', padding: '1.25rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1C1917' }}>
              Live Cloud Sync
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              All additions and picture uploads are permanently saved in MongoDB GridFS and live-synced to all customers.
            </p>
          </div>

          <div className="card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE5D5', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#1C1917', marginBottom: '0.6rem', letterSpacing: '0.06em' }}>
              Picture Upload Tips
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: '#57534E' }}>
              <div>📸 Select direct photos from your phone or device</div>
              <div>✨ Clear high-res images show luxury craft</div>
              <div>🖼️ Images are automatically stored in database</div>
            </div>
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setProductToDelete(null)}>
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
                  Delete Piece
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#57534E', marginTop: '0.35rem', marginBottom: 0, lineHeight: 1.45 }}>
                  Are you sure you want to delete <strong style={{ color: '#1C1917' }}>"{productToDelete.title}"</strong> from the studio collection?
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProduct}
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
                {isDeleting ? 'Deleting...' : 'Delete Piece'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Studio Piece Modal with Picture Upload */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div
            className="modal-content animate-pop-in"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '620px',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #EAE5D5', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#A08020', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  STUDIO PIECE CREATOR
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                  {editingProduct ? 'Edit Studio Piece' : 'Publish New Collection Piece'}
                </h3>
              </div>
              <button
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: '0.3rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              
              {/* Picture Upload Area (User explicitly requested picture upload instead of URL) */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#1C1917' }}>
                    📸 Product Picture
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      style={{
                        background: imageMode === 'upload' ? '#1C1917' : '#FAF7EE',
                        color: imageMode === 'upload' ? '#FFFFFF' : '#78716C',
                        border: '1px solid #D6D3CA',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Upload Picture
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      style={{
                        background: imageMode === 'url' ? '#1C1917' : '#FAF7EE',
                        color: imageMode === 'url' ? '#FFFFFF' : '#78716C',
                        border: '1px solid #D6D3CA',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div>
                    {/* Picture drop/upload box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #D6D1C1',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        textAlign: 'center',
                        backgroundColor: '#FAF7EE',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                      />

                      {imagePreviewUrl ? (
                        <div style={{ position: 'relative', width: '100%', maxHeight: '200px', display: 'flex', justifyContent: 'center' }}>
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          {isUploadingImage && (
                            <div style={{
                              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '8px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF'
                            }}>
                              <Loader2 size={24} className="animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F6E58D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1917' }}>
                            <Camera size={22} />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1C1917', display: 'block' }}>
                              Click to select picture from device
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                              Supports JPG, PNG, WEBP, GIF, SVG (Stored in database)
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {imagePreviewUrl && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.75rem', color: '#2E5A44' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={14} /> Picture attached successfully
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ background: 'none', border: 'none', color: '#78716C', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Change Picture
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      className="form-input"
                      value={coverImage}
                      onChange={e => {
                        setCoverImage(e.target.value);
                        setImagePreviewUrl(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Piece Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Crimson Betta Art Piece"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Handmade & Sculptures">Handmade & Sculptures</option>
                    <option value="Art & Collectibles">Art & Collectibles</option>
                    <option value="Bags & Leather">Bags & Leather</option>
                    <option value="Ceramics & Pottery">Ceramics & Pottery</option>
                    <option value="Studio Decor">Studio Decor</option>
                    <option value="Lifestyle & Living">Lifestyle & Living</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (INR ₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 4500"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Original / Compare Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 5500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value)}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Materials</label>
                  <input
                    type="text"
                    className="form-input"
                    value={materials}
                    onChange={e => setMaterials(e.target.value)}
                    placeholder="e.g. Optical resin, crimson pigments"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dimensions</label>
                  <input
                    type="text"
                    className="form-input"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    placeholder="e.g. 24cm x 16cm x 12cm"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Piece Story & Craftsmanship</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={synopsis}
                  onChange={e => setSynopsis(e.target.value)}
                  placeholder="Tell the story of how this piece was sculpted and handcrafted in our studio..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.75rem',
                  borderRadius: '10px'
                }}
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Saving to Catalog...' : (editingProduct ? 'Save Piece Changes' : 'Publish Piece to Collection')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
