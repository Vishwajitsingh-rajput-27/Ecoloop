import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, TrendingUp, DollarSign, Eye,
  ShoppingBag, Star, Trash2, ToggleLeft, ToggleRight,
  Plus, BarChart2, Clock, CheckCircle, Truck,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";
import { formatCurrency, formatDate, getOrderStatusColor } from "../utils/helpers";
import { cn } from "../utils/cn";
import type { OrderStatus } from "../types";

const STATUS_TABS: (OrderStatus | "All")[] = ["All", "Placed", "Confirmed", "Shipped", "Delivered"];

export const DashboardPage: React.FC = () => {
  const { currentUser, products, orders, updateProduct, deleteProduct, updateOrderStatus } = useStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "orders">("overview");
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "All">("All");

  // Seller's products
  const myProducts = useMemo(
    () => products.filter((p) => p.sellerId === currentUser?.id),
    [products, currentUser]
  );

  // Seller's orders (orders that contain their products)
  const myOrders = useMemo(
    () => orders.filter((o) => o.items.some((i) => i.sellerId === currentUser?.id)),
    [orders, currentUser]
  );

  const filteredOrders = useMemo(
    () => myOrders.filter((o) => orderFilter === "All" || o.status === orderFilter),
    [myOrders, orderFilter]
  );

  // Stats
  const stats = useMemo(() => {
    const activeListings = myProducts.filter((p) => p.isActive).length;
    const totalViews = myProducts.reduce((s, p) => s + p.views, 0);
    const totalRevenue = myOrders
      .filter((o) => o.status === "Delivered")
      .reduce((s, o) => s + o.items
        .filter((i) => i.sellerId === currentUser?.id)
        .reduce((ss, i) => ss + i.priceAtOrder * i.quantity, 0), 0);
    const pendingOrders = myOrders.filter((o) => ["Placed", "Confirmed"].includes(o.status)).length;
    const avgRating = myProducts.length
      ? myProducts.reduce((s, p) => s + p.rating, 0) / myProducts.length
      : 0;

    return { totalListings: myProducts.length, activeListings, totalViews, totalRevenue, pendingOrders, avgRating };
  }, [myProducts, myOrders, currentUser]);

  const handleToggleActive = (productId: string, isActive: boolean) => {
    updateProduct(productId, { isActive: !isActive });
    showToast(`Listing ${!isActive ? "activated" : "deactivated"}`, "success");
  };

  const handleDeleteProduct = (productId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteProduct(productId);
    showToast("Listing deleted", "info");
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    showToast(`Order marked as ${status}`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-green-500" />
            Seller Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Welcome back, {currentUser?.name}!
          </p>
        </div>
        <Link
          to="/sell"
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
        >
          <Plus size={16} />
          Add Listing
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Package, label: "Total Listings", value: stats.totalListings, color: "blue" },
          { icon: ToggleRight, label: "Active Listings", value: stats.activeListings, color: "green" },
          { icon: Eye, label: "Total Views", value: stats.totalViews.toLocaleString(), color: "purple" },
          { icon: DollarSign, label: "Revenue Earned", value: formatCurrency(stats.totalRevenue), color: "teal" },
          { icon: Clock, label: "Pending Orders", value: stats.pendingOrders, color: "amber" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-3`}>
              <Icon size={18} className={`text-${color}-600 dark:text-${color}-400`} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(["overview", "listings", "orders"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ─────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-green-500" />
                Recent Orders
              </h2>
              <button onClick={() => setActiveTab("orders")} className="text-xs text-green-600 dark:text-green-400 hover:underline">
                View all
              </button>
            </div>
            {myOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No orders yet</div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {myOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {order.items[0]?.product.title}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
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
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 size={18} className="text-green-500" />
                Top Listings by Views
              </h2>
              <button onClick={() => setActiveTab("listings")} className="text-xs text-green-600 dark:text-green-400 hover:underline">
                View all
              </button>
            </div>
            {myProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p>No listings yet</p>
                <Link to="/sell" className="text-green-600 hover:underline text-xs mt-1 inline-block">Create your first listing</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {[...myProducts].sort((a, b) => b.views - a.views).slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-4">
                    <img src={product.images[0]} alt={product.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={11} />{product.views}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Star size={11} className="text-amber-400" />{product.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", product.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500")}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seller Rating */}
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Star size={24} fill="currentColor" />
              <h2 className="font-bold text-lg">Seller Rating</h2>
            </div>
            <p className="text-4xl font-extrabold mb-1">{stats.avgRating.toFixed(1)}</p>
            <p className="text-white/70 text-sm">Average across {stats.totalListings} listings</p>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={cn("h-2 flex-1 rounded-full", s <= Math.round(stats.avgRating) ? "bg-white" : "bg-white/30")} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Plus, label: "Add Listing", to: "/sell", color: "green" },
                { icon: ShoppingBag, label: "View Orders", action: () => setActiveTab("orders"), color: "blue" },
                { icon: Package, label: "Manage Stock", action: () => setActiveTab("listings"), color: "purple" },
                { icon: TrendingUp, label: "View Profile", to: "/profile", color: "teal" },
              ].map(({ icon: Icon, label, to, action, color }) => (
                <div key={label}>
                  {to ? (
                    <Link
                      to={to}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-400 hover:bg-${color}-100 dark:hover:bg-${color}-900/40 transition-colors text-center`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={action}
                      className={`w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-400 hover:bg-${color}-100 dark:hover:bg-${color}-900/40 transition-colors`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Listings Tab ─────────────────────────────────────────────────── */}
      {activeTab === "listings" && (
        <div>
          {myProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Package size={64} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No listings yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first listing to start selling</p>
              <Link to="/sell" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
                Create Listing
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {myProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4",
                    !product.isActive && "opacity-60"
                  )}
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{product.title}</h3>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", product.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500")}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1"><Eye size={11} /> {product.views} views</span>
                      <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> {product.rating}</span>
                      <span>{product.quantity} in stock</span>
                      <span>{product.condition}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(product.id, product.isActive)}
                      className={cn("p-2 rounded-xl transition-colors", product.isActive ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}
                      title={product.isActive ? "Deactivate" : "Activate"}
                    >
                      {product.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <Link
                      to={`/products/${product.id}`}
                      className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="View product"
                    >
                      <Eye size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.title)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Orders Tab ───────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div>
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setOrderFilter(tab)}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-colors",
                  orderFilter === tab ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No orders in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Order #{order.id}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.items.map((i) => i.product.title).join(", ").slice(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.address.city}, {order.address.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", getOrderStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "Placed" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "Confirmed")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                      >
                        <CheckCircle size={14} /> Confirm Order
                      </button>
                    )}
                    {order.status === "Confirmed" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "Shipped")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        <Truck size={14} /> Mark Shipped
                      </button>
                    )}
                    {order.status === "Shipped" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <CheckCircle size={14} /> Mark Delivered
                      </button>
                    )}
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye size={14} /> View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
