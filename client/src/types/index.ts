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

export interface Product {
  _id: string;
  title: string;
  author: string;
  category?: string;
  edition?: string;
  price: number;
  originalPrice?: number;
  formats?: string[];
  deliveryTag?: string;
  status: 'Published' | 'Draft';
  featured?: boolean;
  tag: string;
  readingMood?: string;
  pageCount?: number;
  rating?: number;
  synopsis: string;
  description?: string;
  materials?: string;
  dimensions?: string;
  stockQuantity?: number;
  inStock?: boolean;
  image?: string;
  images?: string[];
  coverImage?: string;
  coverGradient?: string;
  coverColor?: string;
  ebookFile?: string;
  fileOriginalName?: string;
  fileSize?: number;
  fileMimeType?: string;
  chapters?: Chapter[];
  sampleChapter?: Chapter;
  reviews?: Review[];
}

export type Book = Product;

export interface CartItem {
  book: Product;
  format?: string;
  quantity?: number;
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
  avatar?: string;
  role: 'customer' | 'admin';
  purchasedBooks: Product[] | string[];
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
  status: 'Paid' | 'Refunded' | 'Pending' | 'Processing' | 'Dispatched' | 'Delivered';
  createdAt: string;
  user?: any;
  book?: any;
}

export interface AdminStats {
  revenueYTD: number;
  totalOrders: number;
  registeredCustomers: number;
  productsCatalogCount?: number;
  booksCatalogCount: number;
  averageOrderValue?: number;
  conversionRate?: string;
  monthlySales2026: {
    month: string;
    revenue: number;
    heightPercentage: number;
    orders?: number;
    active?: boolean;
  }[];
  categoryBreakdown?: {
    category: string;
    revenue: number;
    percentage: number;
    piecesSold: number;
  }[];
  topSellingPieces?: {
    title: string;
    category: string;
    unitsSold: number;
    revenue: number;
    stockRemaining: number;
    rating: number;
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
