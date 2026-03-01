import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "../store/useStore";
import { ProductCard } from "../components/product/ProductCard";

export const WishlistPage: React.FC = () => {
  const { products, currentUser } = useStore();
  const wishlistedProducts = products.filter((p) => currentUser?.wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Heart size={24} className="text-red-500" />
        My Wishlist
        {wishlistedProducts.length > 0 && (
          <span className="text-base font-normal text-gray-500 dark:text-gray-400">({wishlistedProducts.length} items)</span>
        )}
      </h1>

      {wishlistedProducts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Heart size={64} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Save items you love by clicking the heart icon</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-colors">
            <ShoppingBag size={18} />
            Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
