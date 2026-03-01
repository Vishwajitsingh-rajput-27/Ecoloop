// ─── Core Domain Types ───────────────────────────────────────────────────────

export type UserRole = "guest" | "buyer" | "seller" | "admin";
export type ProductCondition = "New" | "Like New" | "Refurbished" | "For Parts Only";
export type OrderStatus = "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
export type WalletTxType = "credit" | "debit" | "topup" | "refund";
export type PaymentMethod = "wallet" | "upi" | "card" | "netbanking";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  addresses: Address[];
  wishlist: string[]; // product IDs
  recentlyViewed: string[];
  notifications: Notification[];
  sellerRating?: number;
  totalSales?: number;
}

export interface Address {
  id: string;
  label: string; // "Home", "Office", etc.
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  condition: ProductCondition;
  age: number; // years
  purchaseYear: number;
  specs: ProductSpec[];
  price: number;
  originalPrice?: number;
  quantity: number;
  images: string[];
  location: { city: string; state: string };
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  rating: number;
  reviewCount: number;
  views: number;
  ecoImpact: { kgDiverted: number; co2Saved: number };
  tags: string[];
  createdAt: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  helpful: number;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  address: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  platformFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  trackingId?: string;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  priceAtOrder: number;
  sellerId: string;
  sellerName: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: WalletTxType;
  amount: number;
  description: string;
  orderId?: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
}

export interface Notification {
  id: string;
  type: "order" | "promo" | "system" | "review";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface SearchFilters {
  query: string;
  categoryId: string;
  condition: ProductCondition | "";
  minPrice: number;
  maxPrice: number;
  location: string;
  sortBy: "newest" | "price_asc" | "price_desc" | "rating" | "popular";
  page: number;
}

export interface SellerStats {
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalViews: number;
  averageRating: number;
}
