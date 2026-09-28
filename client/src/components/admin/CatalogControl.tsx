import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Search, Plus, Edit, Trash2, X, AlertTriangle, UploadCloud, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
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

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Handmade');
  const [price, setPrice] = useState('4500');
  const [originalPrice, setOriginalPrice] = useState('5500');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [synopsis, setSynopsis] = useState('');
  const [materials, setMaterials] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [coverImage, setCoverImage] = useState('');

  // File upload state for image or document
  const [productFile, setProductFile] = useState<File | null>(null);

  const filteredProducts = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (b.tag && b.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory('Handmade');
    setPrice('4500');
    setOriginalPrice('5500');
    setStatus('Published');
    setSynopsis('');
    setMaterials('Hand-glazed ceramic / raw linen / solid wood');
    setDimensions('18cm x 12cm x 24cm');
    setStockQuantity('8');
    setCoverImage('');
    setProductFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setCategory(prod.category || prod.tag || 'Handmade');
    setPrice(prod.price.toString());
    setOriginalPrice((prod.originalPrice || prod.price).toString());
    setStatus(prod.status);
    setSynopsis(prod.synopsis || prod.description || '');
    setMaterials(prod.materials || '');
    setDimensions(prod.dimensions || '');
    setStockQuantity((prod.stockQuantity || 10).toString());
    setCoverImage(prod.coverImage || prod.images?.[0] || '');
    setProductFile(null);
    setIsModalOpen(true);
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
        formData.append('images', JSON.stringify([coverImage.trim()]));
      }

      if (productFile) {
        formData.append('ebookFile', productFile);
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
      
      {/* Title */}
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #EAE5D5', paddingBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A08020', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          ADMIN PORTAL • INVENTORY CONTROL
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.3rem', color: '#1C1917' }}>
          Studio Collection & Inventory
        </h1>
      </div>

      <div className="responsive-grid-admin" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        
        {/* Main Catalog Table Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAE5D5',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          
          {/* Top Search & Add Button Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search studio pieces, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.85rem' }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleOpenAddModal}
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.4rem' }}
            >
              <Plus size={16} /> Add New Piece
            </button>
          </div>

          {/* Catalog Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EAE5D5', color: '#78716C', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Piece</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Materials</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#78716C' }}>
                      No pieces found in the active studio catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => (
                    <tr key={prod._id} style={{ borderBottom: '1px solid #FAF7EE', fontSize: '0.9rem', color: '#1C1917' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={prod.coverImage || prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=150'}
                            alt={prod.title}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1C1917' }}>{prod.title}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#8C827A' }}>{prod.dimensions || 'Studio item'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1C1917', backgroundColor: '#FAF7EE', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #EAE5D5' }}>
                          {prod.category || prod.tag}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: '#57534E', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.materials || 'Handcrafted raw materials'}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: '#1C1917' }}>
                        ₹{prod.price}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>
                        {prod.stockQuantity ?? 10} units
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span className={`badge ${prod.status === 'Published' ? 'badge-green' : 'badge-yellow'}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1C1917', padding: '0.3rem' }}
                            title="Edit Piece"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setProductToDelete(prod)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.3rem' }}
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

        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ backgroundColor: '#FAF7EE', border: '1px solid #EAE5D5', padding: '1.5rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1C1917' }}>
              Live Storefront Sync
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#57534E', lineHeight: 1.6, margin: 0 }}>
              All additions and price modifications update immediately on the customer storefront.
            </p>
          </div>

          <div className="card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE5D5', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#1C1917', marginBottom: '0.75rem' }}>
              Image Guidelines
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem', color: '#57534E' }}>
              <div>• Use high-res square or portrait studio shots</div>
              <div>• Direct Unsplash or CDN URLs supported</div>
              <div>• Highlight texture, natural lighting & craft</div>
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-content animate-pop-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                {editingProduct ? 'Edit Studio Piece' : 'Add New Studio Piece'}
              </h3>
              <button
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Piece Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Ochre Ribbed Ceramic Vase"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Handmade">Handmade</option>
                    <option value="Art">Art Piece</option>
                    <option value="Design">Design & Decor</option>
                    <option value="Living">Studio Living</option>
                    <option value="Accessories">Accessories & Bags</option>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Materials</label>
                  <input
                    type="text"
                    className="form-input"
                    value={materials}
                    onChange={e => setMaterials(e.target.value)}
                    placeholder="e.g. Glazed stoneware, matte finish"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dimensions</label>
                  <input
                    type="text"
                    className="form-input"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    placeholder="e.g. 15cm x 15cm x 28cm"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Piece Story & Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={synopsis}
                  onChange={e => setSynopsis(e.target.value)}
                  placeholder="Tell the story of how this piece was handcrafted with meditation and soul..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Saving Piece...' : (editingProduct ? 'Save Changes' : 'Publish to Collection')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
