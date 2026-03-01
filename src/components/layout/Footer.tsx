import React from "react";
import { Link } from "react-router-dom";
import { Recycle, Mail, Phone, MapPin, Github, Twitter, Instagram, Leaf, Shield, Truck, Code } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-auto">
      {/* Trust Bar */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-b border-green-100 dark:border-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Leaf, title: "Eco Certified", desc: "Every sale diverts e-waste from landfills" },
              { icon: Shield, title: "Buyer Protection", desc: "100% refund on verified issues" },
              { icon: Truck, title: "Pan India Delivery", desc: "Shipping to 900+ cities" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <Recycle size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="gradient-text">Eco</span>
                <span className="text-gray-800 dark:text-white">Loop</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              India's premier marketplace for buying and selling refurbished electronics responsibly.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <button key={i} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Marketplace</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Browse All Products", to: "/products" },
                { label: "Smartphones", to: "/products?cat=smartphones" },
                { label: "Laptops & Computers", to: "/products?cat=laptops" },
                { label: "Audio & Headphones", to: "/products?cat=audio" },
                { label: "Components & Parts", to: "/products?cat=components" },
                { label: "Gaming Gear", to: "/products?cat=gaming" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "My Profile", to: "/profile" },
                { label: "My Orders", to: "/orders" },
                { label: "My Wallet", to: "/wallet" },
                { label: "Wishlist", to: "/wishlist" },
                { label: "Sell Your Device", to: "/sell" },
                { label: "Seller Dashboard", to: "/dashboard" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2">
              <Code size={14} className="text-green-500" />
              Developers
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "🚀 Deployment Guide", to: "/deployment" },
                { label: "Local Dev Setup", to: "/deployment#local" },
                { label: "Docker Setup", to: "/deployment#docker" },
                { label: "API Reference", to: "/deployment#api" },
                { label: "Payment Integration", to: "/deployment#payments" },
                { label: "Database Schema", to: "/deployment#database" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500 dark:text-gray-400">support@ecoloop.in</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500 dark:text-gray-400">+91 1800-123-4567 (Toll Free)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500 dark:text-gray-400">EcoLoop Tech Pvt. Ltd.<br />Bengaluru, Karnataka 560001</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">🌱 We've diverted <span className="font-bold">47.3 tonnes</span> of e-waste from landfills so far!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} EcoLoop Tech Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((item) => (
              <button key={item} className="text-xs text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                {item}
              </button>
            ))}
            <Link to="/deployment" className="text-xs text-green-500 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors">
              🚀 Deploy Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
