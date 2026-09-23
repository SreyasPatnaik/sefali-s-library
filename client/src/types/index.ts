export interface Review {
  _id?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Chapter {
  chapterNumber: number;
  title: string;
  subtitle?: string;
  content: string;
  keyTakeaway?: string;
  pageOffset?: number;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  edition: string;
  price: number;
  formats: ('EPUB' | 'PDF')[];
  deliveryTag: string;
  status: 'Published' | 'Draft';
  featured?: boolean;
  tag: string;
  readingMood?: string;
  pageCount?: number;
  rating?: number;
  synopsis: string;
  coverGradient?: string;
  coverColor?: string;
  ebookFile?: string;
  fileOriginalName?: string;
  fileSize?: number;
  fileMimeType?: string;
  chapters: Chapter[];
  sampleChapter?: Chapter;
  reviews?: Review[];
}

export interface CartItem {
  book: Book;
  format: 'EPUB' | 'PDF';
}

export interface Bookmark {
  bookId: string;
  chapterNumber: number;
  note?: string;
  createdAt?: string;
}

export interface ReadingProgress {
  bookId: string;
  chapterNumber: number;
  lastPage: number;
  percentage: number;
  completed: boolean;
  lastReadAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  purchasedBooks: Book[] | string[];
  readingProgress?: ReadingProgress[];
  bookmarks?: Bookmark[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  bookTitle: string;
  amount: number;
  paymentMethod: string;
  status: 'Paid' | 'Refunded' | 'Pending';
  createdAt: string;
  user?: any;
  book?: any;
}

export interface AdminStats {
  revenueYTD: number;
  totalOrders: number;
  registeredCustomers: number;
  booksCatalogCount: number;
  monthlySales2026: {
    month: string;
    revenue: number;
    heightPercentage: number;
    active?: boolean;
  }[];
  recentTransactions: Order[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  purchasedBooksCount: number;
  totalSpent: number;
  orders: Order[];
  status: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
