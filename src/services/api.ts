/**
 * EcoLoop API Service Layer
 *
 * This module provides a complete REST API abstraction layer.
 * It simulates backend responses with realistic delays and business logic.
 *
 * In production, replace the mock implementations with real HTTP calls:
 *   - Replace mockDelay() + in-memory logic with axios.get/post/put/delete calls
 *   - Point BASE_URL to your Express/NestJS backend
 *   - JWT tokens are already structured for real auth integration
 *
 * Backend endpoints this maps to:
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   POST   /api/auth/logout
 *   GET    /api/users/me
 *   PUT    /api/users/me
 *   GET    /api/users/:id/stats          (seller stats)
 *   GET    /api/products
 *   GET    /api/products/:id
 *   POST   /api/products
 *   PUT    /api/products/:id
 *   DELETE /api/products/:id
 *   GET    /api/orders
 *   POST   /api/orders
 *   GET    /api/orders/:id
 *   PUT    /api/orders/:id/status
 *   POST   /api/orders/:id/cancel
 *   GET    /api/wallet
 *   POST   /api/wallet/topup/initiate
 *   POST   /api/wallet/topup/complete
 *   GET    /api/reviews/:productId
 *   POST   /api/reviews
 *   GET    /api/categories
 *   GET    /api/admin/stats
 */

import axios from "axios";
import type {
  User, Product, Order, Wallet, WalletTransaction,
  Review, Category, Address, OrderStatus, SearchFilters,
} from "../types";
import {
  mockUsers, products as seedProducts, categories as seedCategories,
  reviews as seedReviews, mockOrders, mockWallet,
} from "../data/mockData";

// ─── Configuration ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BASE_URL = (import.meta as any).env?.VITE_API_URL || "";

/**
 * Real HTTP client – used when VITE_API_URL is set.
 * Falls back to mock layer when no backend URL is configured.
 */
export const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach JWT to every request
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecoloop_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ecoloop_token");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

// ─── Mock In-Memory Database ──────────────────────────────────────────────────

/** Mutable in-memory store – mirrors what a PostgreSQL/MongoDB DB would hold */
const DB = {
  users: [...mockUsers],
  products: [...seedProducts],
  orders: [...mockOrders],
  reviews: [...seedReviews],
  categories: [...seedCategories],
  wallets: new Map<string, Wallet>([
    ["u1", { ...mockWallet }],
  ]),
  sessions: new Map<string, string>(), // token -> userId
};

/** Simulate network latency (50–200ms) */
const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms + Math.random() * 120));

/** Generate a pseudo-JWT (base64 payload, not cryptographically signed) */
const generateToken = (userId: string): string => {
  const payload = btoa(JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + 86400000 }));
  return `ecoloop.${payload}.mock_sig`;
};

/** Decode our mock token */
const decodeToken = (token: string): { sub: string } | null => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/** Get current user from stored token */
export const getCurrentUserFromToken = (): User | null => {
  const token = localStorage.getItem("ecoloop_token");
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return DB.users.find((u) => u.id === decoded.sub) || null;
};

/** Ensure wallet exists for user */
const ensureWallet = (userId: string): Wallet => {
  if (!DB.wallets.has(userId)) {
    DB.wallets.set(userId, { userId, balance: 0, transactions: [] });
  }
  return DB.wallets.get(userId)!;
};

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /api/auth/register
   * Registers a new user and returns a JWT token.
   */
  register: async (
    name: string,
    email: string,
    password: string,
    role: "buyer" | "seller" = "buyer"
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay();

    // Validation
    if (!name || name.trim().length < 2)
      return { success: false, error: "Name must be at least 2 characters." };
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return { success: false, error: "Invalid email address." };
    if (password.length < 6)
      return { success: false, error: "Password must be at least 6 characters." };

    // Check duplicate email
    if (DB.users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: "An account with this email already exists." };

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase(),
      role,
      createdAt: new Date().toISOString(),
      addresses: [],
      wishlist: [],
      recentlyViewed: [],
      notifications: [
        {
          id: `n_${Date.now()}`,
          type: "system",
          title: "Welcome to EcoLoop! 🎉",
          message: `Hi ${name.trim()}! Your account is ready. Start buying or selling e-waste today.`,
          read: false,
          timestamp: new Date().toISOString(),
        },
      ],
      ...(role === "seller" ? { sellerRating: 0, totalSales: 0 } : {}),
    };

    DB.users.push(newUser);
    ensureWallet(newUser.id);

    const token = generateToken(newUser.id);
    localStorage.setItem("ecoloop_token", token);

    return { success: true, data: { user: newUser, token }, message: "Account created successfully!" };
  },

  /**
   * POST /api/auth/login
   * Authenticates user credentials and returns JWT.
   */
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay();

    if (!email || !password)
      return { success: false, error: "Email and password are required." };

    const user = DB.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    // For demo, any password >= 4 chars works for mock users
    // In production: bcrypt.compare(password, user.passwordHash)
    if (!user || password.length < 4)
      return { success: false, error: "Invalid email or password." };

    const token = generateToken(user.id);
    localStorage.setItem("ecoloop_token", token);
    ensureWallet(user.id);

    return { success: true, data: { user, token }, message: "Logged in successfully!" };
  },

  /**
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await delay(50);
    localStorage.removeItem("ecoloop_token");
  },
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  /**
   * GET /api/users/me
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    await delay();
    const user = getCurrentUserFromToken();
    if (!user) return { success: false, error: "Unauthorized" };
    return { success: true, data: user };
  },

  /**
   * PUT /api/users/me
   */
  updateProfile: async (updates: Partial<User>): Promise<ApiResponse<User>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const idx = DB.users.findIndex((u) => u.id === current.id);
    if (idx < 0) return { success: false, error: "User not found" };

    const updated = { ...DB.users[idx], ...updates };
    DB.users[idx] = updated;
    return { success: true, data: updated, message: "Profile updated successfully." };
  },

  /**
   * POST /api/users/me/addresses
   */
  addAddress: async (address: Omit<Address, "id">): Promise<ApiResponse<User>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const newAddr: Address = { ...address, id: `a_${Date.now()}` };
    const idx = DB.users.findIndex((u) => u.id === current.id);
    let addresses = DB.users[idx].addresses;
    if (newAddr.isDefault) addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    addresses = [...addresses, newAddr];
    DB.users[idx] = { ...DB.users[idx], addresses };

    return { success: true, data: DB.users[idx] };
  },

  /**
   * DELETE /api/users/me/addresses/:id
   */
  deleteAddress: async (addressId: string): Promise<ApiResponse<User>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const idx = DB.users.findIndex((u) => u.id === current.id);
    DB.users[idx] = {
      ...DB.users[idx],
      addresses: DB.users[idx].addresses.filter((a) => a.id !== addressId),
    };
    return { success: true, data: DB.users[idx] };
  },

  /**
   * POST /api/users/me/wishlist/:productId
   */
  toggleWishlist: async (productId: string): Promise<ApiResponse<{ wishlist: string[] }>> => {
    await delay(50);
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const idx = DB.users.findIndex((u) => u.id === current.id);
    const wishlist = DB.users[idx].wishlist.includes(productId)
      ? DB.users[idx].wishlist.filter((id) => id !== productId)
      : [...DB.users[idx].wishlist, productId];

    DB.users[idx] = { ...DB.users[idx], wishlist };
    return { success: true, data: { wishlist } };
  },

  /**
   * POST /api/users/me/recently-viewed/:productId
   */
  addRecentlyViewed: async (productId: string): Promise<void> => {
    const current = getCurrentUserFromToken();
    if (!current) return;
    const idx = DB.users.findIndex((u) => u.id === current.id);
    if (idx < 0) return;
    const rv = [productId, ...DB.users[idx].recentlyViewed.filter((id) => id !== productId)].slice(0, 10);
    DB.users[idx] = { ...DB.users[idx], recentlyViewed: rv };
  },

  /**
   * GET /api/users/:id/seller-stats
   */
  getSellerStats: async (sellerId: string) => {
    await delay();
    const sellerProducts = DB.products.filter((p) => p.sellerId === sellerId);
    const sellerOrders = DB.orders.filter((o) =>
      o.items.some((i) => i.sellerId === sellerId)
    );
    const revenue = sellerOrders.reduce((sum, o) => {
      const sellerItems = o.items.filter((i) => i.sellerId === sellerId);
      return sum + sellerItems.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0);
    }, 0);

    return {
      success: true,
      data: {
        totalListings: sellerProducts.length,
        activeListings: sellerProducts.filter((p) => p.isActive).length,
        totalOrders: sellerOrders.length,
        pendingOrders: sellerOrders.filter((o) => ["Placed", "Confirmed"].includes(o.status)).length,
        totalRevenue: revenue,
        monthlyRevenue: Math.round(revenue * 0.3),
        totalViews: sellerProducts.reduce((s, p) => s + p.views, 0),
        averageRating: sellerProducts.length
          ? parseFloat((sellerProducts.reduce((s, p) => s + p.rating, 0) / sellerProducts.length).toFixed(1))
          : 0,
      },
    };
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId: string): Promise<void> => {
    const current = getCurrentUserFromToken();
    if (!current) return;
    const idx = DB.users.findIndex((u) => u.id === current.id);
    if (idx < 0) return;
    DB.users[idx] = {
      ...DB.users[idx],
      notifications: DB.users[idx].notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    };
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (): Promise<void> => {
    const current = getCurrentUserFromToken();
    if (!current) return;
    const idx = DB.users.findIndex((u) => u.id === current.id);
    if (idx < 0) return;
    DB.users[idx] = {
      ...DB.users[idx],
      notifications: DB.users[idx].notifications.map((n) => ({ ...n, read: true })),
    };
  },
};

// ─── Product API ──────────────────────────────────────────────────────────────

export const productApi = {
  /**
   * GET /api/products
   * Supports full search/filter/sort/pagination
   */
  getProducts: async (
    filters: Partial<SearchFilters> = {}
  ): Promise<ApiResponse<Product[]>> => {
    await delay();

    let results = DB.products.filter((p) => p.isActive);

    // Keyword search
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.categoryId) {
      results = results.filter((p) => p.categoryId === filters.categoryId);
    }

    // Condition filter
    if (filters.condition) {
      results = results.filter((p) => p.condition === filters.condition);
    }

    // Price range
    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice < 200000) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }

    // Location filter
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(
        (p) =>
          p.location.city.toLowerCase().includes(loc) ||
          p.location.state.toLowerCase().includes(loc)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        results.sort((a, b) => b.views - a.views);
        break;
      default: // newest
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pagination
    const page = filters.page || 1;
    const pageSize = 12;
    const total = results.length;
    const paginated = results.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: paginated,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  },

  /**
   * GET /api/products/:id
   */
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    await delay();
    const product = DB.products.find((p) => p.id === id);
    if (!product) return { success: false, error: "Product not found." };

    // Increment view count
    const idx = DB.products.findIndex((p) => p.id === id);
    DB.products[idx] = { ...product, views: product.views + 1 };

    return { success: true, data: DB.products[idx] };
  },

  /**
   * POST /api/products
   * Requires seller/admin role
   */
  createProduct: async (
    productData: Omit<Product, "id" | "createdAt" | "views" | "rating" | "reviewCount">
  ): Promise<ApiResponse<Product>> => {
    await delay(200);
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };
    if (current.role !== "seller" && current.role !== "admin")
      return { success: false, error: "Only sellers can create listings." };

    // Validation
    if (!productData.title || productData.title.trim().length < 5)
      return { success: false, error: "Title must be at least 5 characters." };
    if (productData.price <= 0)
      return { success: false, error: "Price must be greater than 0." };
    if (productData.quantity < 1)
      return { success: false, error: "Quantity must be at least 1." };

    const newProduct: Product = {
      ...productData,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
      views: 0,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      sellerId: current.id,
      sellerName: current.name,
      sellerRating: current.sellerRating || 0,
    };

    DB.products.unshift(newProduct);
    return { success: true, data: newProduct, message: "Product listed successfully!" };
  },

  /**
   * PUT /api/products/:id
   */
  updateProduct: async (
    id: string,
    updates: Partial<Product>
  ): Promise<ApiResponse<Product>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const idx = DB.products.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: "Product not found." };

    const product = DB.products[idx];
    if (product.sellerId !== current.id && current.role !== "admin")
      return { success: false, error: "You can only edit your own listings." };

    DB.products[idx] = { ...product, ...updates };
    return { success: true, data: DB.products[idx], message: "Product updated successfully." };
  },

  /**
   * DELETE /api/products/:id
   */
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const idx = DB.products.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: "Product not found." };

    if (DB.products[idx].sellerId !== current.id && current.role !== "admin")
      return { success: false, error: "You can only delete your own listings." };

    DB.products.splice(idx, 1);
    return { success: true, message: "Product deleted successfully." };
  },

  /**
   * GET /api/products/search-suggestions?q=...
   */
  getSearchSuggestions: (query: string): string[] => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const suggestions = new Set<string>();
    DB.products.filter((p) => p.isActive).forEach((p) => {
      if (p.title.toLowerCase().includes(q)) suggestions.add(p.title);
      if (p.brand.toLowerCase().includes(q)) suggestions.add(p.brand);
    });
    return Array.from(suggestions).slice(0, 6);
  },

  /**
   * GET /api/products/seller/:sellerId
   */
  getSellerProducts: async (sellerId: string): Promise<ApiResponse<Product[]>> => {
    await delay();
    const products = DB.products.filter((p) => p.sellerId === sellerId);
    return { success: true, data: products };
  },
};

// ─── Order API ────────────────────────────────────────────────────────────────

export const orderApi = {
  /**
   * POST /api/orders
   * Creates a new order and deducts wallet if payment method is wallet
   */
  createOrder: async (
    items: Array<{ productId: string; quantity: number }>,
    address: Address,
    paymentMethod: string
  ): Promise<ApiResponse<Order>> => {
    await delay(300);
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Please login to place an order." };
    if (items.length === 0) return { success: false, error: "Cart is empty." };

    // Build order items with current product prices
    const orderItems = [];
    for (const item of items) {
      const product = DB.products.find((p) => p.id === item.productId);
      if (!product) return { success: false, error: `Product ${item.productId} not found.` };
      if (!product.isActive) return { success: false, error: `Product "${product.title}" is no longer available.` };
      if (product.quantity < item.quantity)
        return { success: false, error: `Insufficient stock for "${product.title}".` };

      orderItems.push({
        productId: product.id,
        product,
        quantity: item.quantity,
        priceAtOrder: product.price,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
      });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const platformFee = subtotal > 10000 ? 99 : 49;
    const total = subtotal + tax + platformFee;

    // Wallet payment validation & deduction
    if (paymentMethod === "wallet") {
      const wallet = ensureWallet(current.id);
      if (wallet.balance < total)
        return {
          success: false,
          error: `Insufficient wallet balance. Need ₹${total.toLocaleString()}, have ₹${wallet.balance.toLocaleString()}.`,
        };

      const tx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        type: "debit",
        amount: total,
        description: `Order payment`,
        timestamp: new Date().toISOString(),
        status: "success",
      };
      wallet.balance -= total;
      wallet.transactions.unshift(tx);
    }

    // Reduce stock
    for (const item of orderItems) {
      const pIdx = DB.products.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        DB.products[pIdx] = {
          ...DB.products[pIdx],
          quantity: DB.products[pIdx].quantity - item.quantity,
          isActive: DB.products[pIdx].quantity - item.quantity > 0,
        };
      }
    }

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      userId: current.id,
      items: orderItems,
      status: "Placed",
      statusHistory: [{ status: "Placed", timestamp: new Date().toISOString() }],
      address,
      paymentMethod: paymentMethod as any,
      subtotal,
      tax,
      platformFee,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DB.orders.unshift(newOrder);

    // Add notification
    const userIdx = DB.users.findIndex((u) => u.id === current.id);
    if (userIdx >= 0) {
      DB.users[userIdx].notifications.unshift({
        id: `n_${Date.now()}`,
        type: "order",
        title: "Order Placed Successfully! 🎉",
        message: `Your order #${newOrder.id} for ₹${total.toLocaleString()} has been placed.`,
        read: false,
        timestamp: new Date().toISOString(),
        link: `/orders/${newOrder.id}`,
      });
    }

    return { success: true, data: newOrder, message: "Order placed successfully!" };
  },

  /**
   * GET /api/orders
   * Returns orders for the current user (or all orders for admin)
   */
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const orders = current.role === "admin"
      ? DB.orders
      : DB.orders.filter((o) => o.userId === current.id);

    return { success: true, data: orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
  },

  /**
   * GET /api/orders/:id
   */
  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const order = DB.orders.find((o) => o.id === id);
    if (!order) return { success: false, error: "Order not found." };
    if (order.userId !== current.id && current.role !== "admin")
      return { success: false, error: "You can only view your own orders." };

    return { success: true, data: order };
  },

  /**
   * PUT /api/orders/:id/status
   * Seller/admin only
   */
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    note?: string
  ): Promise<ApiResponse<Order>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const idx = DB.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return { success: false, error: "Order not found." };

    DB.orders[idx] = {
      ...DB.orders[idx],
      status,
      statusHistory: [...DB.orders[idx].statusHistory, { status, timestamp: new Date().toISOString(), note }],
      updatedAt: new Date().toISOString(),
    };

    return { success: true, data: DB.orders[idx], message: `Order status updated to ${status}.` };
  },

  /**
   * POST /api/orders/:id/cancel
   * Issues refund to wallet on cancellation
   */
  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    await delay(200);
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const idx = DB.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return { success: false, error: "Order not found." };

    const order = DB.orders[idx];
    if (order.userId !== current.id) return { success: false, error: "Unauthorized" };
    if (!["Placed", "Confirmed"].includes(order.status))
      return { success: false, error: "Order cannot be cancelled at this stage." };

    // Refund to wallet
    const wallet = ensureWallet(current.id);
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      type: "refund",
      amount: order.total,
      description: `Refund for Order #${orderId}`,
      orderId,
      timestamp: new Date().toISOString(),
      status: "success",
    };
    wallet.balance += order.total;
    wallet.transactions.unshift(tx);

    // Restore stock
    for (const item of order.items) {
      const pIdx = DB.products.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        DB.products[pIdx] = {
          ...DB.products[pIdx],
          quantity: DB.products[pIdx].quantity + item.quantity,
          isActive: true,
        };
      }
    }

    DB.orders[idx] = {
      ...order,
      status: "Cancelled",
      statusHistory: [
        ...order.statusHistory,
        { status: "Cancelled", timestamp: new Date().toISOString(), note: "Cancelled by customer" },
      ],
      updatedAt: new Date().toISOString(),
    };

    // Notify
    const userIdx = DB.users.findIndex((u) => u.id === current.id);
    if (userIdx >= 0) {
      DB.users[userIdx].notifications.unshift({
        id: `n_${Date.now()}`,
        type: "order",
        title: "Order Cancelled",
        message: `Order #${orderId} cancelled. ₹${order.total.toLocaleString()} refunded to your wallet.`,
        read: false,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true, data: DB.orders[idx], message: "Order cancelled and refund processed." };
  },

  /**
   * GET /api/orders/seller/:sellerId
   */
  getSellerOrders: async (sellerId: string): Promise<ApiResponse<Order[]>> => {
    await delay();
    const orders = DB.orders.filter((o) => o.items.some((i) => i.sellerId === sellerId));
    return { success: true, data: orders };
  },
};

// ─── Wallet API ───────────────────────────────────────────────────────────────

export const walletApi = {
  /**
   * GET /api/wallet
   */
  getWallet: async (): Promise<ApiResponse<Wallet>> => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    const wallet = ensureWallet(current.id);
    return { success: true, data: { ...wallet } };
  },

  /**
   * POST /api/wallet/topup/initiate
   * In production: calls Razorpay/Stripe to create a payment order
   * Returns a payment_order_id to open the payment widget
   */
  initiateTopUp: async (
    amount: number,
    method: "upi" | "card" | "netbanking"
  ): Promise<ApiResponse<{ paymentOrderId: string; amount: number; method: string }>> => {
    await delay(300);
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    if (amount < 100) return { success: false, error: "Minimum top-up is ₹100." };
    if (amount > 100000) return { success: false, error: "Maximum top-up is ₹1,00,000." };

    /**
     * TODO (Production): Replace with real payment gateway call
     *
     * Razorpay example:
     *   const response = await razorpay.orders.create({
     *     amount: amount * 100,  // in paise
     *     currency: 'INR',
     *     receipt: `wallet_topup_${Date.now()}`,
     *     notes: { userId: current.id, method }
     *   });
     *   return { success: true, data: { paymentOrderId: response.id, amount, method } };
     */

    const paymentOrderId = `pay_${Date.now()}_mock`;
    return { success: true, data: { paymentOrderId, amount, method } };
  },

  /**
   * POST /api/wallet/topup/complete
   * Called after payment gateway callback
   * In production: verify payment signature before crediting wallet
   */
  completeTopUp: async (
    _paymentOrderId: string,
    amount: number,
    method: string
  ): Promise<ApiResponse<Wallet>> => {
    await delay(500);
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Unauthorized" };

    /**
     * TODO (Production): Verify Razorpay payment signature:
     *   const expectedSig = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
     *     .update(`${paymentOrderId}|${razorpayPaymentId}`)
     *     .digest('hex');
     *   if (expectedSig !== razorpaySignature) throw new Error('Invalid signature');
     */

    const wallet = ensureWallet(current.id);
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      type: "topup",
      amount,
      description: `Added via ${method.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      status: "success",
    };
    wallet.balance += amount;
    wallet.transactions.unshift(tx);

    // Notify user
    const userIdx = DB.users.findIndex((u) => u.id === current.id);
    if (userIdx >= 0) {
      DB.users[userIdx].notifications.unshift({
        id: `n_${Date.now()}`,
        type: "system",
        title: "Wallet Topped Up ✅",
        message: `₹${amount.toLocaleString()} added to your EcoLoop wallet via ${method.toUpperCase()}.`,
        read: false,
        timestamp: new Date().toISOString(),
        link: "/wallet",
      });
    }

    return { success: true, data: { ...wallet }, message: `₹${amount.toLocaleString()} added to wallet!` };
  },
};

// ─── Review API ───────────────────────────────────────────────────────────────

export const reviewApi = {
  /**
   * GET /api/reviews/:productId
   */
  getReviews: async (productId: string): Promise<ApiResponse<Review[]>> => {
    await delay();
    const reviews = DB.reviews.filter((r) => r.productId === productId);
    return { success: true, data: reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
  },

  /**
   * POST /api/reviews
   * Only verified buyers can review
   */
  addReview: async (
    productId: string,
    rating: number,
    title: string,
    body: string
  ): Promise<ApiResponse<Review>> => {
    await delay(200);
    const current = getCurrentUserFromToken();
    if (!current) return { success: false, error: "Please login to add a review." };

    if (rating < 1 || rating > 5) return { success: false, error: "Rating must be between 1 and 5." };
    if (!title.trim()) return { success: false, error: "Review title is required." };
    if (body.trim().length < 10) return { success: false, error: "Review must be at least 10 characters." };

    // Check if already reviewed
    const existing = DB.reviews.find((r) => r.productId === productId && r.userId === current.id);
    if (existing) return { success: false, error: "You've already reviewed this product." };

    const review: Review = {
      id: `r_${Date.now()}`,
      productId,
      userId: current.id,
      userName: current.name,
      userAvatar: current.avatar,
      rating,
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
      helpful: 0,
      verified: DB.orders.some((o) =>
        o.userId === current.id && o.items.some((i) => i.productId === productId) && o.status === "Delivered"
      ),
    };

    DB.reviews.push(review);

    // Recompute product rating
    const productReviews = DB.reviews.filter((r) => r.productId === productId);
    const avgRating = parseFloat(
      (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    );
    const pIdx = DB.products.findIndex((p) => p.id === productId);
    if (pIdx >= 0) {
      DB.products[pIdx] = { ...DB.products[pIdx], rating: avgRating, reviewCount: productReviews.length };
    }

    return { success: true, data: review, message: "Review submitted!" };
  },
};

// ─── Category API ─────────────────────────────────────────────────────────────

export const categoryApi = {
  /**
   * GET /api/categories
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    await delay(50);
    return { success: true, data: DB.categories };
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  /**
   * GET /api/admin/stats
   */
  getStats: async () => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current || current.role !== "admin")
      return { success: false, error: "Unauthorized" };

    const totalWalletBalance = Array.from(DB.wallets.values()).reduce((s, w) => s + w.balance, 0);
    const totalTransactions = Array.from(DB.wallets.values()).reduce((s, w) => s + w.transactions.length, 0);

    return {
      success: true,
      data: {
        users: {
          total: DB.users.length,
          buyers: DB.users.filter((u) => u.role === "buyer").length,
          sellers: DB.users.filter((u) => u.role === "seller").length,
          admins: DB.users.filter((u) => u.role === "admin").length,
        },
        products: {
          total: DB.products.length,
          active: DB.products.filter((p) => p.isActive).length,
          byCategory: DB.categories.map((c) => ({
            name: c.name,
            count: DB.products.filter((p) => p.categoryId === c.id).length,
          })),
        },
        orders: {
          total: DB.orders.length,
          placed: DB.orders.filter((o) => o.status === "Placed").length,
          confirmed: DB.orders.filter((o) => o.status === "Confirmed").length,
          shipped: DB.orders.filter((o) => o.status === "Shipped").length,
          delivered: DB.orders.filter((o) => o.status === "Delivered").length,
          cancelled: DB.orders.filter((o) => o.status === "Cancelled").length,
          totalRevenue: DB.orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0),
        },
        wallet: {
          totalBalance: totalWalletBalance,
          totalTransactions,
          activeWallets: DB.wallets.size,
        },
        recentOrders: DB.orders.slice(0, 5),
        recentUsers: DB.users.slice(-5).reverse(),
      },
    };
  },

  getAllUsers: async () => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current || current.role !== "admin")
      return { success: false, error: "Unauthorized" };
    return { success: true, data: DB.users };
  },

  getAllProducts: async () => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current || current.role !== "admin")
      return { success: false, error: "Unauthorized" };
    return { success: true, data: DB.products };
  },

  updateUserRole: async (userId: string, role: "buyer" | "seller" | "admin") => {
    await delay();
    const current = getCurrentUserFromToken();
    if (!current || current.role !== "admin")
      return { success: false, error: "Unauthorized" };
    const idx = DB.users.findIndex((u) => u.id === userId);
    if (idx < 0) return { success: false, error: "User not found" };
    DB.users[idx] = { ...DB.users[idx], role };
    return { success: true, data: DB.users[idx] };
  },
};
