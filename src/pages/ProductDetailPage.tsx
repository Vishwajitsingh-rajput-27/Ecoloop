import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, MapPin, Leaf, Star, Eye, Share2,
  ChevronLeft, ChevronRight, Shield, Truck, RotateCcw,
  User, ThumbsUp, Check, Package,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";
import { StarRating } from "../components/ui/StarRating";
import { Badge } from "../components/ui/Badge";
import { ProductCard } from "../components/product/ProductCard";
import { reviews as allReviews } from "../data/mockData";
import { formatCurrency, formatDate, getConditionColor, getDiscountPercent } from "../utils/helpers";
import { cn } from "../utils/cn";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { products, currentUser, isAuthenticated, addToCart, toggleWishlist, addToRecentlyViewed } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [localReviews, setLocalReviews] = useState(allReviews);

  const product = products.find((p) => p.id === id);
  const productReviews = localReviews.filter((r) => r.productId === id);
  const isWishlisted = currentUser?.wishlist.includes(id ?? "") ?? false;
  const related = products.filter((p) => p.categoryId === product?.categoryId && p.id !== id).slice(0, 4);
  const discount = product ? getDiscountPercent(product.price, product.originalPrice) : null;

  useEffect(() => {
    if (id) { addToRecentlyViewed(id); }
    window.scrollTo(0, 0);
  }, [id, addToRecentlyViewed]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h2>
        <Link to="/products" className="text-green-600 hover:underline">← Back to products</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) { showToast("Please login to add to cart", "warning"); navigate("/auth"); return; }
    addToCart(product, qty);
    showToast(`${product.title} added to cart!`, "success");
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { showToast("Please login to buy", "warning"); navigate("/auth"); return; }
    addToCart(product, qty);
    navigate("/checkout");
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { showToast("Please login to wishlist", "warning"); return; }
    toggleWishlist(product.id);
    showToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist!", isWishlisted ? "info" : "success");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { showToast("Please login to review", "warning"); return; }
    if (!reviewForm.title || !reviewForm.body) { showToast("Please fill all fields", "error"); return; }
    const newReview = {
      id: `r_${Date.now()}`,
      productId: id!,
      userId: currentUser!.id,
      userName: currentUser!.name,
      userAvatar: currentUser!.avatar,
      rating: reviewForm.rating,
      title: reviewForm.title,
      body: reviewForm.body,
      createdAt: new Date().toISOString(),
      helpful: 0,
      verified: true,
    };
    setLocalReviews((prev) => [newReview, ...prev]);
    setReviewForm({ rating: 5, title: "", body: "" });
    setShowReviewForm(false);
    showToast("Review submitted!", "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap">
        <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-green-600 transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/products?cat=${product.categoryId}`} className="hover:text-green-600 transition-colors">{product.categoryName}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* ── Image Gallery ─────────────────────────────────────────────────── */}
        <div>
          <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden mb-3">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
            {/* Nav arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((s) => (s - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setSelectedImage((s) => (s + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            {discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn("w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0", selectedImage === i ? "border-green-500" : "border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100")}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Product Info ──────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start gap-2 flex-wrap mb-2">
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getConditionColor(product.condition))}>
                {product.condition}
              </span>
              <Badge variant="gray">{product.categoryName}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">by <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand}</span></p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
            <span className="flex items-center gap-1 text-sm text-gray-400"><Eye size={14} /> {product.views} views</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
                {discount && <span className="text-green-600 font-bold text-lg">{discount}% off</span>}
              </>
            )}
          </div>

          {/* Eco Impact */}
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900">
            <Leaf className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Eco Impact</p>
              <p className="text-xs text-green-700 dark:text-green-400">Buying this diverts <strong>{product.ecoImpact.kgDiverted}kg</strong> of e-waste and saves <strong>{product.ecoImpact.co2Saved}kg CO₂</strong></p>
            </div>
          </div>

          {/* Location & Seller */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <MapPin size={14} className="text-green-500" />
              {product.location.city}, {product.location.state}
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <User size={14} className="text-green-500" />
              {product.sellerName}
              <span className="flex items-center gap-0.5 text-amber-500"><Star size={12} fill="currentColor" />{product.sellerRating}</span>
            </span>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg">−</button>
                <span className="px-4 py-2 font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.quantity, q + 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg">+</button>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{product.quantity} in stock</span>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-green-600/20"
              >
                <Package size={18} />
                Buy Now
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                className={cn("p-3.5 rounded-2xl border-2 transition-colors", isWishlisted ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300")}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </motion.button>
              <button className="p-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Shield, text: "Buyer Protection" },
              { icon: Truck, text: "Pan India Shipping" },
              { icon: RotateCcw, text: "7-Day Returns" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                <Icon size={16} className="text-green-500" />
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Specs & Description ───────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Condition</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{product.condition}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Age</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{product.age} year{product.age !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Purchase Year</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{product.purchaseYear}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Brand</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{product.brand}</span>
              </div>
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{spec.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seller Card */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About the Seller</h2>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(product.sellerName)}&background=16a34a&color=fff&size=48`}
                alt={product.sellerName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{product.sellerName}</p>
                <div className="flex items-center gap-1">
                  <Star size={13} fill="#f59e0b" className="text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.sellerRating}</span>
                  <span className="text-xs text-gray-400">seller rating</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Check size={14} className="text-green-500" />
                Verified seller
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin size={14} className="text-green-500" />
                {product.location.city}, {product.location.state}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews ───────────────────────────────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews ({productReviews.length})</h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            Write a Review
          </button>
        </div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmitReview}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 overflow-hidden"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Write Your Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}>
                        <Star size={24} fill={s <= reviewForm.rating ? "#f59e0b" : "none"} className={s <= reviewForm.rating ? "text-amber-500" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Review Title</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Summarize your experience..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Your Review</label>
                  <textarea
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Share your experience with this product..."
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl text-sm hover:bg-green-700 transition-colors">Submit Review</button>
                  <button type="button" onClick={() => setShowReviewForm(false)} className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {productReviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No reviews yet. Be the first!</div>
        ) : (
          <div className="space-y-4">
            {productReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.userName}</p>
                      <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                      <Check size={12} />Verified Purchase
                    </span>
                  )}
                </div>
                <StarRating rating={review.rating} size="sm" />
                <h4 className="font-semibold text-gray-900 dark:text-white mt-2 mb-1">{review.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{review.body}</p>
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors">
                  <ThumbsUp size={13} />
                  Helpful ({review.helpful})
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Related Products ──────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">People Also Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};
