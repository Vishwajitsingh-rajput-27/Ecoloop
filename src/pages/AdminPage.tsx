import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, Package, ShoppingBag, TrendingUp,
  Leaf, Trash2, Eye, ToggleRight, ToggleLeft, Search,
  BarChart2, DollarSign, Activity,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";
import { formatCurrency, formatDate, getOrderStatusColor } from "../utils/helpers";
import { cn } from "../utils/cn";
import { mockUsers } from "../data/mockData";

type AdminTab = "overview" | "users" | "products" | "orders";

export const AdminPage: React.FC = () => {
  const { products, orders, updateProduct, deleteProduct, updateOrderStatus } = useStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Aggregate stats
  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status === "Delivered")
      .reduce((s, o) => s + o.total, 0);
    const totalEcoKg = products.reduce((s, p) => s + p.ecoImpact.kgDiverted * (p.reviewCount || 1), 0);
    return {
      totalUsers: mockUsers.length,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      totalOrders: orders.length,
      deliveredOrders: orders.filter((o) => o.status === "Delivered").length,
      totalRevenue,
      totalEcoKg: Math.round(totalEcoKg),
      sellers: mockUsers.filter((u) => u.role === "seller").length,
    };
  }, [products, orders]);

  const filteredUsers = useMemo(
    () => mockUsers.filter((u) =>
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    ),
    [userSearch]
  );

  const filteredProducts = useMemo(
    () => products.filter((p) =>
      !productSearch ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
    ),
    [products, productSearch]
  );

  const handleToggleProduct = (id: string, isActive: boolean) => {
    updateProduct(id, { isActive: !isActive });
    showToast(`Product ${!isActive ? "activated" : "deactivated"}`, "success");
  };

  const handleDeleteProduct = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    deleteProduct(id);
    showToast("Product deleted", "info");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
          <Shield size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage the EcoLoop marketplace</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Total Users", value: stats.totalUsers, color: "blue", sub: `${stats.sellers} sellers` },
          { icon: Package, label: "Products", value: stats.totalProducts, color: "purple", sub: `${stats.activeProducts} active` },
          { icon: ShoppingBag, label: "Orders", value: stats.totalOrders, color: "teal", sub: `${stats.deliveredOrders} delivered` },
          { icon: DollarSign, label: "Revenue", value: formatCurrency(stats.totalRevenue), color: "green", sub: "from delivered orders" },
          { icon: Leaf, label: "E-waste Saved", value: `${stats.totalEcoKg}kg`, color: "emerald", sub: "diverted from landfills" },
          { icon: Activity, label: "Active Listings", value: stats.activeProducts, color: "amber", sub: `of ${stats.totalProducts} total` },
          { icon: TrendingUp, label: "Avg Order Value", value: formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / Math.max(stats.deliveredOrders, 1) : 0), color: "rose", sub: "per delivered order" },
          { icon: BarChart2, label: "Conversion Rate", value: `${stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}%`, color: "indigo", sub: "order success rate" },
        ].map(({ icon: Icon, label, value, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className={`w-9 h-9 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-3`}>
              <Icon size={17} className={`text-${color}-600 dark:text-${color}-400`} />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(["overview", "users", "products", "orders"] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize rounded-lg transition-all",
              activeTab === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Overview ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {orders.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-400">#{order.id}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {order.items[0]?.product.title}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getOrderStatusColor(order.status))}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sellers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Top Sellers</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {mockUsers.filter((u) => u.role === "seller").map((seller, i) => (
                <div key={seller.id} className="flex items-center gap-3 p-4">
                  <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                    {i + 1}
                  </span>
                  <img
                    src={seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=16a34a&color=fff`}
                    alt={seller.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{seller.name}</p>
                    <p className="text-xs text-gray-400">{seller.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">⭐ {seller.sellerRating ?? "N/A"}</p>
                    <p className="text-xs text-gray-400">{seller.totalSales ?? 0} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Products by Category</h2>
            {(() => {
              const catMap = products.reduce<Record<string, number>>((acc, p) => {
                acc[p.categoryName] = (acc[p.categoryName] || 0) + 1;
                return acc;
              }, {});
              const max = Math.max(...Object.values(catMap));
              return Object.entries(catMap).map(([cat, count]) => (
                <div key={cat} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{cat}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Eco Impact Summary */}
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white">
            <Leaf size={28} className="mb-3" />
            <h2 className="font-bold text-lg mb-1">Platform Eco Impact</h2>
            <p className="text-white/70 text-sm mb-4">Total environmental benefit of EcoLoop marketplace</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "E-waste Diverted", value: `${stats.totalEcoKg}kg` },
                { label: "CO₂ Saved", value: `${Math.round(stats.totalEcoKg * 70)}kg` },
                { label: "Products Recycled", value: stats.deliveredOrders },
                { label: "Landfills Prevented", value: `${Math.round(stats.totalEcoKg / 0.5)} items` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 rounded-xl p-3">
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-white/70 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Users Tab ────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredUsers.length} users</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">User</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16a34a&color=fff&size=32`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full",
                          user.role === "admin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" :
                          user.role === "seller" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                      <td className="p-4">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="View user">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Products Tab ─────────────────────────────────────────────────── */}
      {activeTab === "products" && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredProducts.length} products</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Product</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Price</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Views</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={cn("hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors", !product.isActive && "opacity-60")}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.title}</p>
                            <p className="text-xs text-gray-400">{product.brand} · {product.sellerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{product.categoryName}</td>
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{product.views}</td>
                      <td className="p-4">
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full",
                          product.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                        )}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleProduct(product.id, product.isActive)}
                            className={cn("p-1.5 rounded-lg transition-colors", product.isActive ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}
                            title={product.isActive ? "Deactivate" : "Activate"}
                          >
                            {product.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.title)}
                            className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Orders Tab ───────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Items</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Total</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Payment</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">#{order.id}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                          {order.items[0]?.product.title}
                          {order.items.length > 1 && ` +${order.items.length - 1}`}
                        </p>
                      </td>
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(order.total)}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 capitalize">{order.paymentMethod}</td>
                      <td className="p-4">
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", getOrderStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          {["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
