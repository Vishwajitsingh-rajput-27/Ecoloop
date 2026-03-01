import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Leaf, Shield, Zap, TrendingUp, Star,
  Recycle, ChevronRight, Award, Users, Package,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { ProductCard } from "../components/product/ProductCard";
import { categories } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, setSearchFilters } = useStore();

  const featuredProducts = products.filter((p) => p.isActive).slice(0, 8);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  const handleCategoryClick = (catName: string) => {
    const cat = categories.find((c) => c.name === catName);
    if (cat) {
      setSearchFilters({ categoryId: cat.id, query: "" });
      navigate("/products");
    }
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-gray-50 via-green-50/30 to-teal-50/20 dark:from-gray-950 dark:via-green-950/20 dark:to-teal-950/10 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-400/10 dark:bg-green-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/10 dark:bg-teal-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                  <Recycle size={14} className="animate-spin" style={{ animationDuration: "3s" }} />
                  India's #1 E-Waste Marketplace
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
                Give Electronics a{" "}
                <span className="gradient-text">Second Life</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                Buy and sell refurbished smartphones, laptops, components and more. Every transaction diverts e-waste from landfills and puts money in your pocket.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="flex items-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5"
                >
                  <Zap size={18} />
                  Shop Now
                </Link>
                <Link
                  to="/sell"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Start Selling
                  <ArrowRight size={18} />
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Users, value: "2.4L+", label: "Users" },
                  { icon: Package, value: "18K+", label: "Products Listed" },
                  { icon: Leaf, value: "47T+", label: "E-waste Saved" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                    <Icon size={20} className="text-green-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Hero Product Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[480px]">
                {featuredProducts.slice(0, 3).map((product, i) => (
                  <motion.div
                    key={product.id}
                    className="absolute bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
                    style={{
                      width: i === 0 ? "62%" : "48%",
                      top: i === 0 ? "0%" : i === 1 ? "12%" : "48%",
                      left: i === 0 ? "0%" : i === 1 ? "40%" : "28%",
                      zIndex: i === 0 ? 3 : i === 1 ? 2 : 1,
                    }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  >
                    <img src={product.images[0]} alt={product.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">{product.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-green-600">{formatCurrency(product.price)}</span>
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">{product.condition}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {/* Eco badge floating */}
                <motion.div
                  className="absolute bottom-0 left-0 bg-gradient-to-br from-green-500 to-teal-500 text-white p-4 rounded-2xl shadow-xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Leaf size={24} />
                  <p className="text-sm font-bold mt-1">47.3 Tonnes</p>
                  <p className="text-xs opacity-80">E-waste diverted</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Find exactly what you need</p>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
              See all <ChevronRight size={16} />
            </Link>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                variants={fadeUp}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">{cat.name}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{cat.productCount}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Featured Listings</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hand-picked deals you'll love</p>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
              View all <ChevronRight size={16} />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why EcoLoop ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Why Choose EcoLoop?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">We make buying and selling refurbished electronics safe, easy, and eco-friendly</p>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Shield, color: "green", title: "Buyer Protection", desc: "Every purchase is covered by our buyer protection policy. Get a full refund if the item isn't as described." },
              { icon: Recycle, color: "teal", title: "Eco Impact Tracking", desc: "See exactly how much e-waste your purchases divert from landfills. Make informed, planet-friendly choices." },
              { icon: Zap, color: "amber", title: "Instant UPI Wallet", desc: "Load your EcoLoop wallet via UPI, cards, or netbanking. Pay instantly and get refunds in seconds." },
              { icon: Award, color: "purple", title: "Verified Sellers", desc: "All sellers are ID-verified and rated by buyers. Shop with confidence from trusted, reviewed sellers." },
              { icon: TrendingUp, color: "blue", title: "Best Prices", desc: "Skip the middleman. Buy directly from sellers and save up to 70% off on original retail prices." },
              { icon: Star, color: "rose", title: "Ratings & Reviews", desc: "Make decisions based on real reviews from verified buyers. Rate your experience and help the community." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className={`text-${color}-600 dark:text-${color}-400`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Top Rated ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">⭐ Top Rated</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Highest rated by our community</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRated.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl p-8 sm:p-12 overflow-hidden text-white"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Have old electronics lying around?</h2>
                <p className="text-white/80 max-w-md">List them on EcoLoop and reach thousands of buyers across India. Get paid instantly to your wallet!</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  to="/auth?tab=register"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white text-green-700 font-semibold rounded-2xl hover:bg-green-50 transition-colors shadow-lg"
                >
                  <Zap size={16} />
                  Create Free Account
                </Link>
                <Link
                  to="/sell"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/30 transition-colors"
                >
                  List a Product
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
