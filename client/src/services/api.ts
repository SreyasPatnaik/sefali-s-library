import { Book, User, Order, AdminStats, CustomerProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const getHeaders = (isFormData: boolean = false) => {
  const token = localStorage.getItem('sefali_token');
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  async registerAdmin(name: string, email: string, password: string, inviteCode: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register-admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, inviteCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Admin registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Books
  async getBooks(query?: { tag?: string; search?: string; status?: string }): Promise<Book[]> {
    try {
      const params = new URLSearchParams();
      if (query?.tag) params.append('tag', query.tag);
      if (query?.search) params.append('search', query.search);
      if (query?.status) params.append('status', query.status);

      const res = await fetch(`${API_BASE}/books?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch books');
      return res.json();
    } catch (err) {
      console.warn('Backend API connection warning, returning cached or empty data:', err);
      return [];
    }
  },

  async getBookSample(bookId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/books/${bookId}/sample`);
    if (!res.ok) throw new Error('Failed to fetch sample');
    return res.json();
  },

  async createBook(bookData: FormData | Partial<Book>): Promise<Book> {
    const isFormData = bookData instanceof FormData;
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? bookData : JSON.stringify(bookData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create book');
    }
    return res.json();
  },

  async updateBook(id: string, bookData: FormData | Partial<Book>): Promise<Book> {
    const isFormData = bookData instanceof FormData;
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: getHeaders(isFormData),
      body: isFormData ? bookData : JSON.stringify(bookData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update book');
    }
    return res.json();
  },

  async deleteBook(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete book');
    }
  },

  async addReview(bookId: string, rating: number, comment: string): Promise<Book> {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to submit review');
    }
    return res.json();
  },

  // Checkout & Orders
  async createOrder(bookId: string, paymentMethod: string, deliveryEmail: string, bookIds?: string[]): Promise<{ order: Order; unlockedBook: Book }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, bookIds, paymentMethod, deliveryEmail })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Checkout failed');
    }
    return res.json();
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async updateProgress(bookId: string, chapterNumber: number, lastPage: number, percentage: number, completed: boolean) {
    const res = await fetch(`${API_BASE}/orders/update-progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, chapterNumber, lastPage, percentage, completed })
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return res.json();
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin orders');
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async getAdminCustomers(): Promise<CustomerProfile[]> {
    const res = await fetch(`${API_BASE}/admin/customers`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin customers');
    return res.json();
  }
};
