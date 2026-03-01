import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, MapPin, Eye, Leaf } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useToast } from "../ui/Toast";
import { StarRating } from "../ui/StarRating";
import { formatCurrency, getDiscountPercent, getConditionColor } from "../../utils/helpers";
import { cn } from "../../utils/cn";
import type { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { isAuthenticated, currentUser, toggleWishlist, addToCart, addToRecentlyViewed } = useStore();
  const { showToast } = useToast();
  const isWishlisted = currentUser?.wishlist.includes(product.id) ?? false;
  const discount = getDiscountPercent(product.price, product.originalPrice);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { showToast("Please login to add to wishlist", "warning"); return; }
    toggleWishlist(product.id);
    showToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist!", isWishlisted ? "info" : "success");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { showToast("Please login to add to cart", "warning"); return; }
    addToCart(product);
    showToast(`${product.title} added to cart!`, "success");
  };

  const handleClick = () => {
    addToRecentlyViewed(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group relative", className)}
    >
      <Link to={`/products/${product.id}`} onClick={handleClick} className="block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all duration-300">
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-700 overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getConditionColor(product.condition))}>
                {product.condition}
              </span>
            </div>
            {/* Eco Badge */}
            <div className="absolute bottom-2 right-2">
              <span className="flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                <Leaf size={9} />
                {product.ecoImpact.kgDiverted}kg saved
              </span>
            </div>
            {/* Wishlist Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleWishlist}
              className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={16}
                className={cn("transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-gray-500")}
              />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{product.brand} · {product.categoryName}</p>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={product.rating} size="sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400">({product.reviewCount})</span>
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 ml-auto">
                <Eye size={11} />
                {product.views}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <MapPin size={11} />
                {product.location.city}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {product.quantity} in stock
              </span>
            </div>

            {/* Add to Cart */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 duration-200"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
