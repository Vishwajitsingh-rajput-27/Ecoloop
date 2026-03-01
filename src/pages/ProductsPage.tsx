import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, Grid2X2, List, Search } from "lucide-react";
import { useStore } from "../store/useStore";
import { ProductCard } from "../components/product/ProductCard";
import { filterAndSortProducts, paginate, PAGINATION_SIZE } from "../utils/helpers";
import { categories } from "../data/mockData";
import { cn } from "../utils/cn";
import type { ProductCondition, SearchFilters } from "../types";

const CONDITIONS: ProductCondition[] = ["New", "Like New", "Refurbished", "For Parts Only"];
const SORTS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
] as const;

export const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, searchFilters, setSearchFilters, resetFilters } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localQuery, setLocalQuery] = useState(searchFilters.query);

  // Sync URL params
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) {
      const found = categories.find((c) => c.slug === cat || c.name.toLowerCase() === cat);
      if (found) setSearchFilters({ categoryId: found.id });
    }
  }, [searchParams, setSearchFilters]);

  const filtered = useMemo(() => filterAndSortProducts(products, searchFilters), [products, searchFilters]);
  const totalPages = Math.ceil(filtered.length / PAGINATION_SIZE);
  const paginated = paginate(filtered, searchFilters.page);

  const activeFilterCount = [
    searchFilters.categoryId,
    searchFilters.condition,
    searchFilters.location,
    searchFilters.minPrice > 0,
    searchFilters.maxPrice < 200000,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {searchFilters.query ? `Results for "${searchFilters.query}"` : "Browse Products"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={searchFilters.sortBy}
            onChange={(e) => setSearchFilters({ sortBy: e.target.value as typeof searchFilters.sortBy })}
            className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* View toggle */}
          <div className="hidden sm:flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn("p-2 transition-colors", viewMode === mode ? "bg-green-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
              >
                {mode === "grid" ? <Grid2X2 size={18} /> : <List size={18} />}
              </button>
            ))}
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors lg:hidden", showFilters ? "bg-green-600 text-white border-green-600" : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800")}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar Filters ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {(showFilters || true) && (
            <motion.aside
              initial={false}
              className={cn("flex-shrink-0 w-64 space-y-5", "hidden lg:block")}
            >
              <FilterPanel
                filters={searchFilters}
                setFilters={setSearchFilters}
                resetFilters={resetFilters}
                activeCount={activeFilterCount}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Filters Overlay */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden flex"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="relative bg-white dark:bg-gray-900 w-72 h-full overflow-y-auto p-5 space-y-5 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X size={20} />
                  </button>
                </div>
                <FilterPanel
                  filters={searchFilters}
                  setFilters={setSearchFilters}
                  resetFilters={resetFilters}
                  activeCount={activeFilterCount}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Product Grid ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 flex gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
              <Search size={18} className="ml-3 self-center text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") setSearchFilters({ query: localQuery, page: 1 }); }}
                placeholder="Search within results..."
                className="flex-1 px-2 py-2.5 text-sm bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
              />
              {localQuery && (
                <button onClick={() => { setLocalQuery(""); setSearchFilters({ query: "", page: 1 }); }} className="pr-3 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setSearchFilters({ query: localQuery, page: 1 })}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>

          {paginated.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
              <button onClick={resetFilters} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <>
              <div className={cn(
                "grid gap-5",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
              )}>
                {paginated.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={product} className={viewMode === "list" ? "max-w-full" : ""} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setSearchFilters({ page: searchFilters.page - 1 })}
                    disabled={searchFilters.page <= 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setSearchFilters({ page })}
                      className={cn("w-10 h-10 rounded-xl text-sm font-medium transition-colors", searchFilters.page === page ? "bg-green-600 text-white" : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800")}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setSearchFilters({ page: searchFilters.page + 1 })}
                    disabled={searchFilters.page >= totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Filter Panel ─────────────────────────────────────────────────────────────
const FilterPanel: React.FC<{
  filters: SearchFilters;
  setFilters: (f: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  activeCount: number;
}> = ({ filters, setFilters, resetFilters, activeCount }) => {
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  return (
    <div className="space-y-5">
      {/* Reset */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Filters</h3>
        {activeCount > 0 && (
          <button onClick={resetFilters} className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium">
            Reset all ({activeCount})
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          <button
            onClick={() => setFilters({ categoryId: "", page: 1 })}
            className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors", !filters.categoryId ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters({ categoryId: cat.id, page: 1 })}
              className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2", filters.categoryId === cat.id ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
            >
              <span>{cat.icon}</span>
              <span className="flex-1">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.productCount}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        <div className="space-y-1.5">
          {CONDITIONS.map((cond) => (
            <label key={cond} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.condition === cond}
                onChange={() => setFilters({ condition: filters.condition === cond ? "" : cond, page: 1 })}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{cond}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              onBlur={() => setFilters({ minPrice: priceRange[0] })}
              placeholder="Min"
              className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-400 flex-shrink-0">–</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              onBlur={() => setFilters({ maxPrice: priceRange[1] })}
              placeholder="Max"
              className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[[0, 5000], [5000, 20000], [20000, 50000], [50000, 200000]].map(([min, max]) => (
              <button
                key={`${min}-${max}`}
                onClick={() => { setPriceRange([min, max]); setFilters({ minPrice: min, maxPrice: max, page: 1 }); }}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-colors",
                  filters.minPrice === min && filters.maxPrice === max
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400"
                )}
              >
                ₹{min === 0 ? "0" : `${min / 1000}K`}–₹{max / 1000}K
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location">
        <input
          type="text"
          value={filters.location}
          onChange={(e) => setFilters({ location: e.target.value, page: 1 })}
          placeholder="City or State..."
          className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </FilterSection>
    </div>
  );
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3"
      >
        {title}
        <ChevronDown size={16} className={cn("text-gray-400 transition-transform", open ? "rotate-180" : "")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
