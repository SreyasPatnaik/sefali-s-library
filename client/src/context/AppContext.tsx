import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, User, AdminStats, CartItem, Toast } from '../types';
import { api } from '../services/api';
import { ToastContainer } from '../components/common/ToastContainer';

interface AppContextType {
  activeMode: 'customer' | 'admin';
  setActiveMode: (mode: 'customer' | 'admin') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminUrl: boolean;
  navigateToAdmin: () => void;
  navigateToStorefront: () => void;
  products: Product[];
  books: Product[]; // backward compatibility
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setBooks: React.Dispatch<React.SetStateAction<Product[]>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  activeProductForDetails: Product | null;
  setActiveProductForDetails: (product: Product | null) => void;
  activeBookForDetails: Product | null; // backward compatibility
  setActiveBookForDetails: (product: Product | null) => void;
  activeBookForReader: Product | null;
  setActiveBookForReader: (product: Product | null) => void;
  readerIsSample: boolean;
  setReaderIsSample: (isSample: boolean) => void;
  checkoutProduct: Product | null;
  setCheckoutProduct: (product: Product | null) => void;
  checkoutBook: Product | null; // backward compatibility
  setCheckoutBook: (product: Product | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  adminStats: AdminStats | null;
  cart: CartItem[];
  addToCart: (product: Product, format?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;
  refreshAdminStats: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  purchaseProduct: (product: Product, paymentMethod: string, email: string) => Promise<void>;
  purchaseBook: (product: Product, paymentMethod: string, email: string) => Promise<void>;
  purchaseCart: (paymentMethod: string, email: string) => Promise<void>;
  handleGoogleLogin: (credentialPayload: { credential?: string; email?: string; name?: string; picture?: string }) => Promise<void>;
  logout: () => void;
  updateUserReadingProgress: (bookId: string, chapterNumber: number, lastPage: number, percentage: number) => void;
  submitReview: (productId: string, rating: number, comment: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const checkIsAdminUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.includes('.admin') ||
    window.location.hash.includes('.admin') ||
    window.location.search.includes('.admin') ||
    window.location.pathname.endsWith('/admin')
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminUrl, setIsAdminUrl] = useState<boolean>(checkIsAdminUrl);
  const [activeMode, setActiveMode] = useState<'customer' | 'admin'>(() => checkIsAdminUrl() ? 'admin' : 'customer');
  const [activeTab, setActiveTab] = useState<string>(() => checkIsAdminUrl() ? 'catalog' : 'storefront');
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('theshefalisspace_cart') || localStorage.getItem('sefali_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [activeProductForDetails, setActiveProductForDetails] = useState<Product | null>(null);
  const [activeBookForReader, setActiveBookForReader] = useState<Product | null>(null);
  const [readerIsSample, setReaderIsSample] = useState<boolean>(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Monitor URL changes for .admin secret entry
  useEffect(() => {
    const handleUrlChange = () => {
      const adminPresent = checkIsAdminUrl();
      setIsAdminUrl(adminPresent);
      if (adminPresent) {
        setActiveMode('admin');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToAdmin = useCallback(() => {
    if (!window.location.pathname.includes('.admin') && !window.location.hash.includes('.admin')) {
      window.history.pushState({}, '', '/.admin');
    }
    setIsAdminUrl(true);
    setActiveMode('admin');
    setActiveTab('catalog');
  }, []);

  const navigateToStorefront = useCallback(() => {
    if (window.location.pathname.includes('.admin') || window.location.hash.includes('.admin')) {
      window.history.pushState({}, '', '/');
    }
    setIsAdminUrl(false);
    setActiveMode('customer');
    setActiveTab('storefront');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('theshefalisspace_cart', JSON.stringify(cart));
      localStorage.setItem('sefali_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Lock background scroll whenever any modal or drawer is open
  useEffect(() => {
    const anyModalOpen =
      authModalOpen ||
      !!activeProductForDetails ||
      !!activeBookForReader ||
      !!checkoutProduct ||
      isCartDrawerOpen;

    if (anyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [authModalOpen, activeProductForDetails, activeBookForReader, checkoutProduct, isCartDrawerOpen]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshProducts = async () => {
    try {
      const fetched = await api.getBooks();
      if (Array.isArray(fetched)) {
        setProducts(fetched);
      }
    } catch (err) {
      console.warn('Failed to load products:', err);
    }
  };

  const refreshAdminStats = async () => {
    try {
      const stats = await api.getAdminStats();
      setAdminStats(stats);
    } catch (err) {
      console.warn('Admin stats update error:', err);
    }
  };

  // Restore authenticated user session on mount
  useEffect(() => {
    const initSession = async () => {
      await refreshProducts();
      const token = localStorage.getItem('sefali_token');
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
          if (u.role === 'admin' && checkIsAdminUrl()) {
            setActiveMode('admin');
            setActiveTab('catalog');
            refreshAdminStats();
          } else {
            setActiveMode('customer');
            setActiveTab('storefront');
          }
        } catch {
          localStorage.removeItem('sefali_token');
          setUser(null);
          if (checkIsAdminUrl()) {
            setActiveMode('admin');
          } else {
            setActiveMode('customer');
            setActiveTab('storefront');
          }
        }
      }
    };
    initSession();
  }, []);

  // Safe setters for guest visitors (prompt login if needed)
  const safeSetActiveProductForDetails = (product: Product | null) => {
    setActiveProductForDetails(product);
  };

  const safeSetCheckoutProduct = (product: Product | null) => {
    if (product && !user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      addToast('info', 'Please sign in with Google or your account to complete checkout.');
      return;
    }
    setCheckoutProduct(product);
  };

  const safeSetIsCartDrawerOpen = (isOpen: boolean) => {
    setIsCartDrawerOpen(isOpen);
  };

  const addToCart = (product: Product, format: string = 'STANDARD') => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.book._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + 1;
        addToast('success', `Increased quantity of "${product.title}" in your bag.`);
        return updated;
      }
      addToast('success', `Added "${product.title}" to your studio bag.`);
      return [...prev, { book: product, format, quantity: 1 }];
    });
    setIsCartDrawerOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => item.book._id === productId ? { ...item, quantity } : item)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.book._id !== productId));
    addToast('info', 'Item removed from bag.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleGoogleLogin = async (credentialPayload: { credential?: string; email?: string; name?: string; picture?: string }) => {
    try {
      const res = await api.googleLogin(credentialPayload);
      localStorage.setItem('sefali_token', res.token);
      setUser(res.user);
      setAuthModalOpen(false);

      if (res.user.role === 'admin' && checkIsAdminUrl()) {
        setActiveMode('admin');
        setActiveTab('catalog');
        await refreshAdminStats();
      } else {
        setActiveMode('customer');
      }

      addToast('success', `Signed in as ${res.user.name}`);
    } catch (err: any) {
      addToast('error', err.message || 'Google Sign-In failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('sefali_token');
    setUser(null);
    setActiveProductForDetails(null);
    setActiveBookForReader(null);
    setCheckoutProduct(null);
    setIsCartDrawerOpen(false);
    if (checkIsAdminUrl()) {
      setActiveMode('admin');
    } else {
      setActiveMode('customer');
      setActiveTab('storefront');
    }
    addToast('info', 'Signed out successfully.');
  };

  const purchaseProduct = async (product: Product, paymentMethod: string, email: string) => {
    try {
      await api.createOrder(product._id, paymentMethod, email);
      if (user) {
        const u = await api.getMe();
        setUser(u);
      }
      removeFromCart(product._id);
      addToast('success', `Order confirmed! "${product.title}" placed successfully.`);
      if (user?.role === 'admin') {
        await refreshAdminStats();
      }
    } catch (err: any) {
      addToast('error', err.message || 'Order failed');
      throw err;
    }
  };

  const purchaseCart = async (paymentMethod: string, email: string) => {
    if (cart.length === 0) return;
    try {
      const productIds = cart.map(item => item.book._id);
      await api.createOrder(cart[0].book._id, paymentMethod, email, productIds);
      if (user) {
        const u = await api.getMe();
        setUser(u);
      }
      clearCart();
      setIsCartDrawerOpen(false);
      addToast('success', `Thank you for your order! Purchased ${cart.length} studio piece(s).`);
      if (user?.role === 'admin') {
        await refreshAdminStats();
      }
    } catch (err: any) {
      addToast('error', err.message || 'Checkout failed');
      throw err;
    }
  };

  const updateUserReadingProgress = (bookId: string, chapterNumber: number, lastPage: number, percentage: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const existing = prev.readingProgress || [];
      const updated = existing.map(p => {
        if (p.bookId === bookId) {
          return {
            ...p,
            chapterNumber,
            lastPage,
            percentage,
            completed: percentage >= 100
          };
        }
        return p;
      });

      if (!updated.some(p => p.bookId === bookId)) {
        updated.push({
          bookId,
          chapterNumber,
          lastPage,
          percentage,
          completed: percentage >= 100
        });
      }

      return {
        ...prev,
        readingProgress: updated
      };
    });

    api.updateProgress(bookId, chapterNumber, lastPage, percentage, percentage >= 100).catch(() => {});
  };

  const submitReview = async (productId: string, rating: number, comment: string) => {
    try {
      const updatedProduct = await api.addReview(productId, rating, comment);
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      if (activeProductForDetails && activeProductForDetails._id === updatedProduct._id) {
        setActiveProductForDetails(updatedProduct);
      }
      addToast('success', 'Your studio review has been published!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to submit review');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeMode,
        setActiveMode,
        activeTab,
        setActiveTab,
        isAdminUrl,
        navigateToAdmin,
        navigateToStorefront,
        products,
        books: products,
        setProducts,
        setBooks: setProducts,
        user,
        setUser,
        activeProductForDetails,
        setActiveProductForDetails: safeSetActiveProductForDetails,
        activeBookForDetails: activeProductForDetails,
        setActiveBookForDetails: safeSetActiveProductForDetails,
        activeBookForReader,
        setActiveBookForReader,
        readerIsSample,
        setReaderIsSample,
        checkoutProduct,
        setCheckoutProduct: safeSetCheckoutProduct,
        checkoutBook: checkoutProduct,
        setCheckoutBook: safeSetCheckoutProduct,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        adminStats,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen: safeSetIsCartDrawerOpen,
        toasts,
        addToast,
        removeToast,
        refreshAdminStats,
        refreshProducts,
        refreshBooks: refreshProducts,
        purchaseProduct,
        purchaseBook: purchaseProduct,
        purchaseCart,
        handleGoogleLogin,
        logout,
        updateUserReadingProgress,
        submitReview
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
