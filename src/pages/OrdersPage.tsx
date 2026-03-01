import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatDate, getOrderStatusColor } from "../utils/helpers";
import type { OrderStatus } from "../types";

const STATUS_TABS: (OrderStatus | "All")[] = ["All", "Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export const OrdersPage: React.FC = () => {
  const { orders, currentUser } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "All">("All");

  const myOrders = orders
    .filter((o) => o.userId === currentUser?.id)
    .filter((o) => filter === "All" || o.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Package size={24} />
        My Orders
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {myOrders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Package size={64} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your order history will appear here</p>
          <Link to="/products" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-colors">
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Order #{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-3 min-w-0 flex-1">
                      <img src={item.product.images[0]} alt={item.product.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.product.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} · {formatCurrency(item.priceAtOrder)}</p>
                        <p className="text-xs text-gray-400">Seller: {item.sellerName}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total: </span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                    <span className="text-xs text-gray-400 ml-2 capitalize">via {order.paymentMethod}</span>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                  >
                    View Details <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Progress bar */}
              {!["Cancelled", "Refunded"].includes(order.status) && (
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-1">
                    {["Placed", "Confirmed", "Shipped", "Delivered"].map((s, i) => {
                      const statuses = ["Placed", "Confirmed", "Shipped", "Delivered"];
                      const current = statuses.indexOf(order.status);
                      const isActive = i <= current;
                      return (
                        <React.Fragment key={s}>
                          <div className={`text-center flex-shrink-0 ${isActive ? "text-green-600 dark:text-green-400" : "text-gray-300 dark:text-gray-600"}`}>
                            <div className={`w-3 h-3 rounded-full mx-auto ${isActive ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                            <p className="text-[10px] mt-1 hidden sm:block">{s}</p>
                          </div>
                          {i < 3 && <div className={`flex-1 h-0.5 ${i < current ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
