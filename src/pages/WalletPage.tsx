import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, RotateCcw, Smartphone, CreditCard, Building2, TrendingUp, CheckCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";
import { formatCurrency, formatDateTime } from "../utils/helpers";
import { cn } from "../utils/cn";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export const WalletPage: React.FC = () => {
  const { wallet, topUpWallet } = useStore();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions ?? [];

  const handleTopUp = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) { showToast("Minimum top-up is ₹100", "error"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800)); // Simulate payment processing
    const result = await topUpWallet(amt, method === "upi" ? `UPI (${upiId || "GPay"})` : method === "card" ? "Debit/Credit Card" : "Net Banking");
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setAmount("");
      setUpiId("");
      setTimeout(() => setSuccess(false), 3000);
      showToast(result.message || "Money added!", "success");
    } else {
      showToast(result.message || "Payment failed.", "error");
    }
  };

  const txTypeConfig = {
    topup: { icon: <ArrowDownLeft size={16} />, color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30", sign: "+" },
    credit: { icon: <ArrowDownLeft size={16} />, color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30", sign: "+" },
    debit: { icon: <ArrowUpRight size={16} />, color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30", sign: "-" },
    refund: { icon: <RotateCcw size={16} />, color: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30", sign: "+" },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Wallet size={24} />
        My Wallet
      </h1>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Balance + Top-up */}
        <div className="lg:col-span-2 space-y-5">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-green-600 to-teal-600 rounded-3xl p-6 text-white overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-8 -translate-x-4" />
            <div className="relative z-10">
              <p className="text-white/70 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-extrabold mb-4">{formatCurrency(balance)}</p>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-white/70" />
                <span className="text-xs text-white/70">EcoLoop Wallet • Instant Transfers</span>
              </div>
            </div>
          </motion.div>

          {/* Top-up Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Add Money</h2>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors", amount === String(amt) ? "bg-green-600 text-white border-green-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400")}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-base font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              placeholder="₹ Enter amount"
            />

            {/* Payment Method */}
            <div className="space-y-2 mb-4">
              {[
                { id: "upi" as const, icon: <Smartphone size={16} />, label: "UPI", desc: "GPay, PhonePe, Paytm" },
                { id: "card" as const, icon: <CreditCard size={16} />, label: "Card", desc: "Debit / Credit" },
                { id: "netbanking" as const, icon: <Building2 size={16} />, label: "Net Banking", desc: "All major banks" },
              ].map(({ id, icon, label, desc }) => (
                <label key={id} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors", method === id ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300")}>
                  <input type="radio" checked={method === id} onChange={() => setMethod(id)} className="accent-green-600" />
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", method === id ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500")}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {method === "upi" && (
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                placeholder="yourname@upi or +91 number"
              />
            )}

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-semibold"
                >
                  <CheckCircle size={20} />
                  Money added successfully!
                </motion.div>
              ) : (
                <motion.button
                  key="btn"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTopUp}
                  disabled={loading || !amount}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={18} />Add {amount ? formatCurrency(Number(amount)) : "Money"}</>}
                </motion.button>
              )}
            </AnimatePresence>
            <p className="text-xs text-center text-gray-400 mt-2">🔒 Secured by mock payment gateway. Demo only.</p>
          </div>
        </div>

        {/* Right: Transaction History */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Transaction History</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{transactions.length} transactions</p>
            </div>

            {transactions.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Wallet size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-[600px] overflow-y-auto">
                {transactions.map((tx, i) => {
                  const config = txTypeConfig[tx.type];
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", config.color)}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{tx.description}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(tx.timestamp)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("font-bold text-sm", tx.type === "debit" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")}>
                          {config.sign}{formatCurrency(tx.amount)}
                        </p>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
                          tx.status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                          tx.status === "pending" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
