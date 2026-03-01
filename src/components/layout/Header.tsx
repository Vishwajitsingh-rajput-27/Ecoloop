import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Sun, Moon, Bell, User, Search, Wallet,
  ChevronDown, LogOut, Settings, Package, LayoutDashboard,
  Heart, X, Recycle, Zap,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { formatCurrency } from "../../utils/helpers";
import { Badge } from "../ui/Badge";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isAuthenticated, currentUser, logout, cartCount, wallet, getSearchSuggestions, setSearchFilters } = useStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = currentUser?.notifications.filter((n) => !n.read).length ?? 0;
  const count = cartCount();

  React.useEffect(() => {
    if (searchQuery.length >= 2) {
      setSuggestions(getSearchSuggestions(searchQuery));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, getSearchSuggestions]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q?: string) => {
    const query = q || searchQuery;
    setSearchFilters({ query, page: 1 });
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    navigate("/products");
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Recycle size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block">
              <span className="gradient-text">Eco</span>
              <span className="text-gray-800 dark:text-white">Loop</span>
            </span>
          </Link>

          {/* Search Bar – Desktop */}
          <div ref={searchRef} className="hidden md:flex flex-1 relative max-w-xl">
            <div className="flex w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search phones, laptops, components..."
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                aria-label="Search products"
              />
              <button
                onClick={() => handleSearch()}
                className="px-4 bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setSearchQuery(s); handleSearch(s); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                    >
                      <Search size={14} className="text-gray-400 flex-shrink-0" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {/* Mobile Search */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9, rotate: 20 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            {/* Wallet */}
            {isAuthenticated && (
              <Link to="/wallet" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-sm font-medium">
                <Wallet size={16} />
                <span>{formatCurrency(wallet?.balance ?? 0)}</span>
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                  className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <NotificationPanel
                      notifications={currentUser?.notifications ?? []}
                      onClose={() => setShowNotifications(false)}
                      onNavigate={(link) => { if (link) { navigate(link); setShowNotifications(false); } }}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Cart (${count} items)`}
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {count > 9 ? "9+" : count}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="User menu"
                >
                  <img
                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=16a34a&color=fff`}
                    alt={currentUser?.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-green-500/30"
                  />
                  <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                        <Badge variant="green" className="mt-1">{currentUser?.role}</Badge>
                      </div>
                      <div className="py-1">
                        {[
                          { icon: User, label: "My Profile", to: "/profile" },
                          { icon: Package, label: "My Orders", to: "/orders" },
                          { icon: Heart, label: "Wishlist", to: "/wishlist" },
                          { icon: Wallet, label: "Wallet", to: "/wallet" },
                          ...(currentUser?.role === "seller" || currentUser?.role === "admin" ? [{ icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" }] : []),
                          { icon: Settings, label: "Settings", to: "/profile" },
                        ].map(({ icon: Icon, label, to }) => (
                          <Link
                            key={label}
                            to={to}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Icon size={16} className="text-gray-400" />
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Sign In
                </Link>
                <Link to="/auth?tab=register" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm">
                  <Zap size={14} />
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-3"
            >
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button onClick={() => handleSearch()} className="px-4 py-2.5 bg-green-600 text-white rounded-xl">
                  <Search size={18} />
                </button>
                <button onClick={() => setMobileSearchOpen(false)} className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Nav */}
      <div className="hidden lg:block border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
            {["Smartphones", "Laptops", "Tablets", "Components", "Audio", "Cameras", "Gaming", "Appliances"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSearchFilters({ query: "", categoryId: "" });
                  navigate(`/products?cat=${cat.toLowerCase()}`);
                }}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-400 hover:shadow-sm transition-all"
              >
                {cat}
              </button>
            ))}
            <div className="flex-1" />
            <Link to="/sell" className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
              + Sell Your Device
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

// ─── Notification Panel ────────────────────────────────────────────────────────
const NotificationPanel: React.FC<{
  notifications: import("../../types").Notification[];
  onClose: () => void;
  onNavigate: (link?: string) => void;
}> = ({ notifications, onClose, onNavigate }) => {
  const { markAllNotificationsRead, markNotificationRead } = useStore();
  const typeIcons: Record<string, string> = { order: "📦", promo: "🏷️", system: "⚙️", review: "⭐" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button onClick={markAllNotificationsRead} className="text-xs text-green-600 dark:text-green-400 hover:underline">Mark all read</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No notifications yet</div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <button
              key={n.id}
              onClick={() => { markNotificationRead(n.id); onNavigate(n.link); onClose(); }}
              className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${!n.read ? "bg-green-50/50 dark:bg-green-900/10" : ""}`}
            >
              <span className="text-lg flex-shrink-0">{typeIcons[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>{n.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.timestamp).toLocaleDateString("en-IN")}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1" />}
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Header;
