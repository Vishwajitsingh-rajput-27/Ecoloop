/**
 * EcoLoop Global State Store
 *
 * Uses Zustand for state management with persist middleware.
 * All async operations delegate to the API service layer (src/services/api.ts),
 * which contains all business logic and simulates a real REST backend.
 *
 * Architecture:
 *   UI Components → useStore actions → API Service → In-memory DB (mock backend)
 *
 * In production:
 *   UI Components → useStore actions → API Service → Real HTTP calls → Express/NestJS → PostgreSQL
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User, Product, CartItem, Order, Wallet,
  SearchFilters, Address, Notification, OrderStatus, PaymentMethod,
} from "../types";
import {
  authApi, userApi, productApi, orderApi, walletApi, reviewApi,
  categoryApi, getCurrentUserFromToken,
} from "../services/api";
import type { Review, Category } from "../types";
import { products as allProducts } from "../data/mockData";

// ─── State Shape ──────────────────────────────────────────────────────────────
interface AppState {
  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, role?: "buyer" | "seller") => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Profile & Addresses
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>;
  addAddress: (address: Omit<Address, "id">) => Promise<{ success: boolean; message: string }>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => void;

  // Products (local cache + API)
  products: Product[];
  categories: Category[];
  searchFilters: SearchFilters;
  isProductsLoading: boolean;
  productsMeta: { total: number; totalPages: number } | null;

  fetchProducts: (filters?: Partial<SearchFilters>) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "views" | "rating" | "reviewCount">) => Promise<{ success: boolean; message: string; product?: Product }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message: string }>;
  getProductById: (id: string) => Promise<Product | null>;

  // Wishlist
  toggleWishlist: (productId: string) => Promise<void>;

  // Recently Viewed
  addToRecentlyViewed: (productId: string) => void;

  // Cart (local state – no backend needed until checkout)
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Orders
  orders: Order[];
  isOrdersLoading: boolean;

  fetchOrders: () => Promise<void>;
  placeOrder: (address: Address, paymentMethod: PaymentMethod) => Promise<{ success: boolean; orderId?: string; message: string }>;
  cancelOrder: (orderId: string) => Promise<{ success: boolean; message: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;

  // Reviews
  reviews: Record<string, Review[]>; // productId -> reviews
  fetchReviews: (productId: string) => Promise<void>;
  addReview: (productId: string, rating: number, title: string, body: string) => Promise<{ success: boolean; message: string }>;

  // Wallet
  wallet: Wallet | null;
  isWalletLoading: boolean;

  fetchWallet: () => Promise<void>;
  topUpWallet: (amount: number, method: string) => Promise<{ success: boolean; message: string }>;
  getWalletBalance: () => number;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;

  // Search Suggestions
  getSearchSuggestions: (query: string) => string[];
}

const defaultFilters: SearchFilters = {
  query: "", categoryId: "", condition: "", minPrice: 0, maxPrice: 200000,
  location: "", sortBy: "newest", page: 1,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Theme ─────────────────────────────────────────────────────────────
      theme: "light",
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        document.documentElement.classList.toggle("dark", next === "dark");
      },

      // ── Auth ──────────────────────────────────────────────────────────────
      currentUser: null,
      isAuthenticated: false,
      isAuthLoading: false,

      login: async (email, password) => {
        set({ isAuthLoading: true });
        try {
          const res = await authApi.login(email, password);
          if (res.success && res.data) {
            set({ currentUser: res.data.user, isAuthenticated: true });
            // Pre-fetch wallet
            get().fetchWallet();
            return { success: true, message: res.message || "Logged in!" };
          }
          return { success: false, message: res.error || "Login failed." };
        } finally {
          set({ isAuthLoading: false });
        }
      },

      register: async (name, email, password, role = "buyer") => {
        set({ isAuthLoading: true });
        try {
          const res = await authApi.register(name, email, password, role);
          if (res.success && res.data) {
            set({ currentUser: res.data.user, isAuthenticated: true });
            get().fetchWallet();
            return { success: true, message: res.message || "Account created!" };
          }
          return { success: false, message: res.error || "Registration failed." };
        } finally {
          set({ isAuthLoading: false });
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ currentUser: null, isAuthenticated: false, wallet: null, orders: [], cart: [] });
      },

      refreshUser: async () => {
        const res = await userApi.getProfile();
        if (res.success && res.data) {
          set({ currentUser: res.data, isAuthenticated: true });
        }
      },

      // ── Profile & Addresses ───────────────────────────────────────────────
      updateProfile: async (updates) => {
        const res = await userApi.updateProfile(updates);
        if (res.success && res.data) {
          set({ currentUser: res.data });
          return { success: true, message: res.message || "Profile updated." };
        }
        return { success: false, message: res.error || "Update failed." };
      },

      addAddress: async (address) => {
        const res = await userApi.addAddress(address);
        if (res.success && res.data) {
          set({ currentUser: res.data });
          return { success: true, message: "Address added." };
        }
        return { success: false, message: res.error || "Failed to add address." };
      },

      deleteAddress: async (addressId) => {
        const res = await userApi.deleteAddress(addressId);
        if (res.success && res.data) set({ currentUser: res.data });
      },

      setDefaultAddress: (addressId) => {
        const user = get().currentUser;
        if (!user) return;
        const addresses = user.addresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
        get().updateProfile({ addresses });
      },

      // ── Products ──────────────────────────────────────────────────────────
      products: allProducts, // Start with seed data for instant display
      categories: [],
      searchFilters: defaultFilters,
      isProductsLoading: false,
      productsMeta: null,

      fetchProducts: async (filters) => {
        set({ isProductsLoading: true });
        try {
          const appliedFilters = { ...get().searchFilters, ...filters };
          const res = await productApi.getProducts(appliedFilters);
          if (res.success && res.data) {
            set({
              products: res.data,
              productsMeta: res.meta ? { total: res.meta.total, totalPages: res.meta.totalPages } : null,
            });
          }
        } finally {
          set({ isProductsLoading: false });
        }
      },

      fetchCategories: async () => {
        const res = await categoryApi.getCategories();
        if (res.success && res.data) set({ categories: res.data });
      },

      setSearchFilters: (filters) => {
        set((s) => ({ searchFilters: { ...s.searchFilters, ...filters, page: filters.page ?? 1 } }));
      },

      resetFilters: () => set({ searchFilters: defaultFilters }),

      addProduct: async (productData) => {
        const res = await productApi.createProduct(productData);
        if (res.success && res.data) {
          set((s) => ({ products: [res.data!, ...s.products] }));
          return { success: true, message: res.message || "Product listed!", product: res.data };
        }
        return { success: false, message: res.error || "Failed to create listing." };
      },

      updateProduct: async (id, updates) => {
        const res = await productApi.updateProduct(id, updates);
        if (res.success && res.data) {
          set((s) => ({
            products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }));
        }
      },

      deleteProduct: async (id) => {
        const res = await productApi.deleteProduct(id);
        if (res.success) {
          set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
          return { success: true, message: res.message || "Deleted." };
        }
        return { success: false, message: res.error || "Failed to delete." };
      },

      getProductById: async (id) => {
        const res = await productApi.getProduct(id);
        if (res.success && res.data) {
          set((s) => ({
            products: s.products.some((p) => p.id === id)
              ? s.products.map((p) => (p.id === id ? res.data! : p))
              : [res.data!, ...s.products],
          }));
          return res.data;
        }
        return null;
      },

      // ── Wishlist ──────────────────────────────────────────────────────────
      toggleWishlist: async (productId) => {
        const user = get().currentUser;
        if (!user) return;
        // Optimistic update
        const wishlist = user.wishlist.includes(productId)
          ? user.wishlist.filter((id) => id !== productId)
          : [...user.wishlist, productId];
        set({ currentUser: { ...user, wishlist } });
        // Sync with API
        await userApi.toggleWishlist(productId);
      },

      // ── Recently Viewed ───────────────────────────────────────────────────
      addToRecentlyViewed: (productId) => {
        const user = get().currentUser;
        if (!user) return;
        const rv = [productId, ...user.recentlyViewed.filter((id) => id !== productId)].slice(0, 10);
        set({ currentUser: { ...user, recentlyViewed: rv } });
        userApi.addRecentlyViewed(productId); // fire-and-forget
      },

      // ── Cart ──────────────────────────────────────────────────────────────
      cart: [],

      addToCart: (product, quantity = 1) => {
        set((s) => {
          const existing = s.cart.find((i) => i.productId === product.id);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.quantity) }
                  : i
              ),
            };
          }
          return { cart: [...s.cart, { productId: product.id, product, quantity }] };
        });
      },

      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((i) => i.productId !== productId) })),

      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeFromCart(productId); return; }
        set((s) => ({
          cart: s.cart.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ cart: [] }),

      cartTotal: () => get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      // ── Orders ────────────────────────────────────────────────────────────
      orders: [],
      isOrdersLoading: false,

      fetchOrders: async () => {
        if (!get().isAuthenticated) return;
        set({ isOrdersLoading: true });
        try {
          const res = await orderApi.getOrders();
          if (res.success && res.data) set({ orders: res.data });
        } finally {
          set({ isOrdersLoading: false });
        }
      },

      placeOrder: async (address, paymentMethod) => {
        const { cart } = get();
        if (cart.length === 0) return { success: false, message: "Cart is empty." };

        const items = cart.map((i) => ({ productId: i.productId, quantity: i.quantity }));
        const res = await orderApi.createOrder(items, address, paymentMethod);

        if (res.success && res.data) {
          set((s) => ({ orders: [res.data!, ...s.orders] }));
          get().clearCart();
          // Refresh wallet if paid via wallet
          if (paymentMethod === "wallet") get().fetchWallet();
          return { success: true, orderId: res.data.id, message: res.message || "Order placed!" };
        }
        return { success: false, message: res.error || "Order failed." };
      },

      cancelOrder: async (orderId) => {
        const res = await orderApi.cancelOrder(orderId);
        if (res.success && res.data) {
          set((s) => ({
            orders: s.orders.map((o) => (o.id === orderId ? res.data! : o)),
          }));
          get().fetchWallet(); // Refresh wallet for refund
          return { success: true, message: res.message || "Order cancelled." };
        }
        return { success: false, message: res.error || "Cancellation failed." };
      },

      updateOrderStatus: async (orderId, status, note) => {
        const res = await orderApi.updateOrderStatus(orderId, status, note);
        if (res.success && res.data) {
          set((s) => ({
            orders: s.orders.map((o) => (o.id === orderId ? res.data! : o)),
          }));
        }
      },

      // ── Reviews ───────────────────────────────────────────────────────────
      reviews: {},

      fetchReviews: async (productId) => {
        const res = await reviewApi.getReviews(productId);
        if (res.success && res.data) {
          set((s) => ({ reviews: { ...s.reviews, [productId]: res.data! } }));
        }
      },

      addReview: async (productId, rating, title, body) => {
        const res = await reviewApi.addReview(productId, rating, title, body);
        if (res.success && res.data) {
          set((s) => ({
            reviews: {
              ...s.reviews,
              [productId]: [res.data!, ...(s.reviews[productId] || [])],
            },
          }));
          return { success: true, message: res.message || "Review submitted!" };
        }
        return { success: false, message: res.error || "Review failed." };
      },

      // ── Wallet ────────────────────────────────────────────────────────────
      wallet: null,
      isWalletLoading: false,

      fetchWallet: async () => {
        if (!get().isAuthenticated) return;
        set({ isWalletLoading: true });
        try {
          const res = await walletApi.getWallet();
          if (res.success && res.data) set({ wallet: res.data });
        } finally {
          set({ isWalletLoading: false });
        }
      },

      topUpWallet: async (amount, method) => {
        // Step 1: Initiate top-up (creates payment order in production)
        const initiateRes = await walletApi.initiateTopUp(
          amount,
          method as "upi" | "card" | "netbanking"
        );
        if (!initiateRes.success || !initiateRes.data)
          return { success: false, message: initiateRes.error || "Failed to initiate payment." };

        /**
         * TODO (Production): At this point, open the Razorpay/Stripe payment widget:
         *   const options = {
         *     key: process.env.RAZORPAY_KEY_ID,
         *     amount: initiateRes.data.amount * 100,
         *     currency: 'INR',
         *     order_id: initiateRes.data.paymentOrderId,
         *     handler: async (response) => {
         *       await walletApi.completeTopUp(response.razorpay_order_id, amount, method);
         *       get().fetchWallet();
         *     }
         *   };
         *   new window.Razorpay(options).open();
         */

        // Step 2: Complete top-up (mock: immediate success)
        const completeRes = await walletApi.completeTopUp(
          initiateRes.data.paymentOrderId,
          amount,
          method
        );
        if (completeRes.success && completeRes.data) {
          set({ wallet: completeRes.data });
          // Refresh current user for notification
          get().refreshUser();
          return { success: true, message: completeRes.message || `₹${amount.toLocaleString()} added!` };
        }
        return { success: false, message: completeRes.error || "Payment failed." };
      },

      getWalletBalance: () => get().wallet?.balance ?? 0,

      // ── Notifications ─────────────────────────────────────────────────────
      markNotificationRead: (id) => {
        const user = get().currentUser;
        if (!user) return;
        const notifications = user.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        set({ currentUser: { ...user, notifications } });
        userApi.markNotificationRead(id); // sync with API
      },

      markAllNotificationsRead: () => {
        const user = get().currentUser;
        if (!user) return;
        const notifications = user.notifications.map((n) => ({ ...n, read: true }));
        set({ currentUser: { ...user, notifications } });
        userApi.markAllNotificationsRead();
      },

      addNotification: (notification) => {
        const user = get().currentUser;
        if (!user) return;
        const newNotification: Notification = {
          ...notification,
          id: `n_${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        set({ currentUser: { ...user, notifications: [newNotification, ...user.notifications] } });
      },

      // ── Search Suggestions ────────────────────────────────────────────────
      getSearchSuggestions: (query) => productApi.getSearchSuggestions(query),
    }),
    {
      name: "ecoloop-store",
      // Only persist theme and cart to localStorage – auth/data comes from API
      partialize: (state) => ({
        theme: state.theme,
        cart: state.cart,
      }),
    }
  )
);

/**
 * Hydrate store from token on app startup.
 * Called once in App.tsx useEffect.
 */
export const hydrateAuth = async () => {
  const user = getCurrentUserFromToken();
  if (user) {
    useStore.setState({ currentUser: user, isAuthenticated: true });
    // Fetch live data
    await Promise.all([
      useStore.getState().fetchWallet(),
      useStore.getState().fetchOrders(),
    ]);
  }
};
