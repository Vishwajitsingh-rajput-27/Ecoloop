import type { Product, SearchFilters, OrderStatus } from "../types";

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateString));

export const formatDateTime = (dateString: string): string =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));

export const getDiscountPercent = (price: number, originalPrice?: number): number | null => {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const filterAndSortProducts = (products: Product[], filters: SearchFilters): Product[] => {
  let result = products.filter((p) => p.isActive);

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.categoryName.toLowerCase().includes(q)
    );
  }

  if (filters.categoryId) result = result.filter((p) => p.categoryId === filters.categoryId);
  if (filters.condition) result = result.filter((p) => p.condition === filters.condition);
  if (filters.location) result = result.filter((p) =>
    p.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
    p.location.state.toLowerCase().includes(filters.location.toLowerCase())
  );

  result = result.filter((p) => p.price >= filters.minPrice && p.price <= filters.maxPrice);

  switch (filters.sortBy) {
    case "price_asc": result.sort((a, b) => a.price - b.price); break;
    case "price_desc": result.sort((a, b) => b.price - a.price); break;
    case "rating": result.sort((a, b) => b.rating - a.rating); break;
    case "popular": result.sort((a, b) => b.views - a.views); break;
    default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    Placed: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
    Confirmed: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400",
    Shipped: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400",
    Delivered: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
    Cancelled: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400",
    Refunded: "text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return map[status] ?? "text-gray-600 bg-gray-50";
};

export const getConditionColor = (condition: string): string => {
  const map: Record<string, string> = {
    "New": "text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-400",
    "Like New": "text-teal-700 bg-teal-100 dark:bg-teal-900/40 dark:text-teal-400",
    "Refurbished": "text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400",
    "For Parts Only": "text-orange-700 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-400",
  };
  return map[condition] ?? "text-gray-700 bg-gray-100";
};

export const generateId = (): string => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? text.slice(0, maxLength) + "…" : text;

export const PAGINATION_SIZE = 9;

export const paginate = <T>(arr: T[], page: number, size: number = PAGINATION_SIZE): T[] =>
  arr.slice((page - 1) * size, page * size);
