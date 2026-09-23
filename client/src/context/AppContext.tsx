import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, User, Order, AdminStats, ReadingProgress, CartItem, Toast } from '../types';
import { api } from '../services/api';
import { ToastContainer } from '../components/common/ToastContainer';

interface AppContextType {
  activeMode: 'customer' | 'admin';
  setActiveMode: (mode: 'customer' | 'admin') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  activeBookForDetails: Book | null;
  setActiveBookForDetails: (book: Book | null) => void;
  activeBookForReader: Book | null;
  setActiveBookForReader: (book: Book | null) => void;
  readerIsSample: boolean;
  setReaderIsSample: (isSample: boolean) => void;
  checkoutBook: Book | null;
  setCheckoutBook: (book: Book | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  adminStats: AdminStats | null;
  cart: CartItem[];
  addToCart: (book: Book, format?: 'EPUB' | 'PDF') => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;
  refreshAdminStats: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  purchaseBook: (book: Book, paymentMethod: string, email: string) => Promise<void>;
  purchaseCart: (paymentMethod: string, email: string) => Promise<void>;
  logout: () => void;
  updateUserReadingProgress: (bookId: string, chapterNumber: number, lastPage: number, percentage: number) => void;
  submitReview: (bookId: string, rating: number, comment: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<'customer' | 'admin'>('customer');
  const [activeTab, setActiveTab] = useState<string>('storefront');
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sefali_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [activeBookForDetails, setActiveBookForDetails] = useState<Book | null>(null);
  const [activeBookForReader, setActiveBookForReader] = useState<Book | null>(null);
  const [readerIsSample, setReaderIsSample] = useState<boolean>(false);
  const [checkoutBook, setCheckoutBook] = useState<Book | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sefali_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Lock background scroll whenever any modal or drawer is open
  useEffect(() => {
    const anyModalOpen =
      authModalOpen ||
      !!activeBookForDetails ||
      !!activeBookForReader ||
      !!checkoutBook ||
      isCartDrawerOpen;

    if (anyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [authModalOpen, activeBookForDetails, activeBookForReader, checkoutBook, isCartDrawerOpen]);

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

  const refreshBooks = async () => {
    try {
      const fetchedBooks = await api.getBooks();
      if (Array.isArray(fetchedBooks)) {
        setBooks(fetchedBooks);
      }
    } catch (err) {
      console.warn('Failed to load books:', err);
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

  // Restore authenticated user session on mount and route according to role
  useEffect(() => {
    const initSession = async () => {
      await refreshBooks();
      const token = localStorage.getItem('sefali_token');
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
          if (u.role === 'admin') {
            setActiveMode('admin');
            setActiveTab('catalog'); // Default to Book Publishing & Catalog Control for Admin
            refreshAdminStats();
          } else {
            setActiveMode('customer');
            setActiveTab('storefront');
          }
        } catch {
          localStorage.removeItem('sefali_token');
          setUser(null);
          setActiveMode('customer');
          setActiveTab('storefront');
        }
      }
    };
    initSession();
  }, []);

  // When user is not logged in, immediately close any active details, reader, checkout, or cart
  useEffect(() => {
    if (!user) {
      setActiveBookForDetails(null);
      setActiveBookForReader(null);
      setCheckoutBook(null);
      setIsCartDrawerOpen(false);
    }
  }, [user]);

  // Guarded setters that require authentication
  const safeSetActiveBookForDetails = (book: Book | null) => {
    if (book && !user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      addToast('info', 'Please sign in or register to preview books and view details.');
      return;
    }
    setActiveBookForDetails(book);
  };

  const safeSetActiveBookForReader = (book: Book | null) => {
    if (book && !user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      addToast('info', 'Please sign in or register to preview or read books.');
      return;
    }
    setActiveBookForReader(book);
  };

  const safeSetCheckoutBook = (book: Book | null) => {
    if (book && !user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      addToast('info', 'Please sign in or register to purchase books.');
      return;
    }
    setCheckoutBook(book);
  };

  const safeSetIsCartDrawerOpen = (isOpen: boolean) => {
    if (isOpen && !user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      addToast('info', 'Please sign in or register to view your shopping cart.');
      return;
    }
    setIsCartDrawerOpen(isOpen);
  };

  const addToCart = (book: Book, format: 'EPUB' | 'PDF' = 'EPUB') => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      addToast('info', 'Please sign in or register to add books to your cart.');
      return;
    }
    if (cart.some(item => item.book._id === book._id)) {
      addToast('info', `"${book.title}" is already in your cart.`);
      setIsCartDrawerOpen(true);
      return;
    }
    setCart(prev => [...prev, { book, format }]);
    addToast('success', `Added "${book.title}" to cart.`);
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(item => item.book._id !== bookId));
    addToast('info', 'Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const logout = () => {
    localStorage.removeItem('sefali_token');
    setUser(null);
    setActiveBookForDetails(null);
    setActiveBookForReader(null);
    setCheckoutBook(null);
    setIsCartDrawerOpen(false);
    setActiveMode('customer');
    setActiveTab('storefront');
    addToast('info', 'Signed out successfully.');
  };

  const purchaseBook = async (book: Book, paymentMethod: string, email: string) => {
    try {
      await api.createOrder(book._id, paymentMethod, email);
      if (user) {
        const u = await api.getMe();
        setUser(u);
      }
      removeFromCart(book._id);
      addToast('success', `Order confirmed! "${book.title}" unlocked in My Shelf.`);
      if (user?.role === 'admin') {
        await refreshAdminStats();
      }
    } catch (err: any) {
      addToast('error', err.message || 'Purchase failed');
      throw err;
    }
  };

  const purchaseCart = async (paymentMethod: string, email: string) => {
    if (cart.length === 0) return;
    try {
      const bookIds = cart.map(item => item.book._id);
      await api.createOrder(cart[0].book._id, paymentMethod, email, bookIds);
      if (user) {
        const u = await api.getMe();
        setUser(u);
      }
      clearCart();
      setIsCartDrawerOpen(false);
      addToast('success', `Successfully purchased ${cart.length} book(s)! Unlocked in My Shelf.`);
      if (user?.role === 'admin') {
        await refreshAdminStats();
      }
    } catch (err: any) {
      addToast('error', err.message || 'Cart checkout failed');
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

  const submitReview = async (bookId: string, rating: number, comment: string) => {
    try {
      const updatedBook = await api.addReview(bookId, rating, comment);
      setBooks(prev => prev.map(b => b._id === updatedBook._id ? updatedBook : b));
      if (activeBookForDetails && activeBookForDetails._id === updatedBook._id) {
        setActiveBookForDetails(updatedBook);
      }
      addToast('success', 'Your review has been published!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to post review');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeMode,
        setActiveMode,
        activeTab,
        setActiveTab,
        books,
        setBooks,
        user,
        setUser,
        activeBookForDetails,
        setActiveBookForDetails: safeSetActiveBookForDetails,
        activeBookForReader,
        setActiveBookForReader: safeSetActiveBookForReader,
        readerIsSample,
        setReaderIsSample,
        checkoutBook,
        setCheckoutBook: safeSetCheckoutBook,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        adminStats,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen: safeSetIsCartDrawerOpen,
        toasts,
        addToast,
        removeToast,
        refreshAdminStats,
        refreshBooks,
        purchaseBook,
        purchaseCart,
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
