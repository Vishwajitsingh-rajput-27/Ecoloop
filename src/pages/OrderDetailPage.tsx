import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CreditCard, Truck, Check, X, ArrowLeft, Clock } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";
import { formatCurrency, formatDateTime, getOrderStatusColor } from "../utils/helpers";

const STATUS_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"] as const;

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { orders, cancelOrder } = useStore();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 dark:text-gray-400">Order not found.</p>
        <Link to="/orders" className="text-green-600 hover:underline mt-2 block">← Back to Orders</Link>
      </div>
    );
  }

  const canCancel = ["Placed", "Confirmed"].includes(order.status);
  const currentStep = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);

  const handleCancel = () => {
    if (!canCancel) return;
    cancelOrder(order.id);
    showToast("Order cancelled. Refund will be credited to your wallet.", "success");
    navigate("/orders");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getOrderStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Order Progress */}
          {!["Cancelled", "Refunded"].includes(order.status) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-5">Order Progress</h2>
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700" />
                {currentStep >= 0 && (
                  <div
                    className="absolute top-4 left-4 h-0.5 bg-green-500 transition-all duration-1000"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                )}
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const isComplete = currentStep >= i;
                    const isCurrent = currentStep === i;
                    return (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <motion.div
                          initial={false}
                          animate={isComplete ? { scale: [1.2, 1] } : {}}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white dark:bg-gray-800 transition-colors ${
                            isComplete ? "border-green-500 bg-green-500 text-white" :
                            "border-gray-300 dark:border-gray-600 text-gray-400"
                          }`}
                        >
                          {isComplete ? <Check size={16} /> : i + 1}
                        </motion.div>
                        <span className={`text-xs font-medium text-center ${isCurrent ? "text-green-600 dark:text-green-400" : isComplete ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {order.trackingId && (
                <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <Truck size={14} className="inline mr-1.5" />
                    Tracking ID: <strong>{order.trackingId}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status History */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Status Timeline</h2>
            <div className="space-y-4">
              {[...order.statusHistory].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
                    {entry.status === "Cancelled" ? <X size={14} /> : <Clock size={14} />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${i === 0 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{entry.status}</p>
                    {entry.note && <p className="text-xs text-gray-500 dark:text-gray-400">{entry.note}</p>}
                    <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <Link to={`/products/${item.productId}`}>
                    <img src={item.product.images[0]} alt={item.product.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-green-600 transition-colors line-clamp-2">
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Seller: {item.sellerName}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatCurrency(item.priceAtOrder)}</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm flex-shrink-0">
                    {formatCurrency(item.priceAtOrder * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Price Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Price Breakdown</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="font-medium">{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">GST</span><span className="font-medium">{formatCurrency(order.tax)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Platform Fee</span><span className="font-medium">{formatCurrency(order.platformFee)}</span></div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2.5 flex justify-between font-bold">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-green-500" /> Delivery Address
            </h2>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.address.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.address.line1}</p>
            {order.address.line2 && <p className="text-sm text-gray-500 dark:text-gray-400">{order.address.line2}</p>}
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.address.city}, {order.address.state} – {order.address.pincode}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.address.phone}</p>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-green-500" /> Payment
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{order.paymentMethod}</p>
          </div>

          {/* Actions */}
          {canCancel && (
            <button
              onClick={handleCancel}
              className="w-full py-3 border-2 border-red-400 text-red-600 dark:text-red-400 font-semibold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
