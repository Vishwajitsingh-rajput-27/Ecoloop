import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Leaf, ShoppingBag } from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency } from "../utils/helpers";
import { useToast } from "../components/ui/Toast";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, cartTotal, isAuthenticated } = useStore();
  const { showToast } = useToast();

  const subtotal = cartTotal();
  const tax = Math.round(subtotal * 0.05);
  const platformFee = subtotal > 0 ? 99 : 0;
  const total = subtotal + tax + platformFee;
  const totalEco = cart.reduce((sum, i) => sum + i.product.ecoImpact.kgDiverted * i.quantity, 0);

  const handleRemove = (productId: string, title: string) => {
    removeFromCart(productId);
    showToast(`${title.slice(0, 30)}... removed`, "info");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <ShoppingCart size={24} />
        Shopping Cart
        {cart.length > 0 && (
          <span className="text-base font-normal text-gray-500 dark:text-gray-400">({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
        )}
      </h1>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <ShoppingBag size={64} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add some refurbished electronics and make an eco-friendly choice!</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-colors">
            <ShoppingCart size={18} />
            Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex gap-4"
                >
                  <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-green-600 transition-colors line-clamp-2 text-sm">
                        {item.product.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.product.brand} · {item.product.condition}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Seller: {item.product.sellerName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Leaf size={12} className="text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">{item.product.ecoImpact.kgDiverted}kg e-waste saved</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.quantity}
                          className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemove(item.productId, item.product.title)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">GST (5%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(platformFee)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Eco Impact */}
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl mb-5">
                <Leaf size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400">
                  This order diverts <strong>{totalEco.toFixed(2)}kg</strong> of e-waste from landfills! 🌿
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!isAuthenticated) { navigate("/auth"); return; }
                  navigate("/checkout");
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-green-600/20"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </motion.button>
              <Link
                to="/products"
                className="block text-center mt-3 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
