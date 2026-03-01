import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Building2, Wallet, Check, Plus, MapPin, AlertCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";
import { formatCurrency } from "../utils/helpers";
import type { PaymentMethod, Address } from "../types";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "wallet", label: "EcoLoop Wallet", icon: <Wallet size={20} />, desc: "Pay from your wallet balance" },
  { id: "upi", label: "UPI", icon: <Smartphone size={20} />, desc: "GPay, PhonePe, Paytm, BHIM" },
  { id: "card", label: "Debit / Credit Card", icon: <CreditCard size={20} />, desc: "Visa, Mastercard, Rupay" },
  { id: "netbanking", label: "Net Banking", icon: <Building2 size={20} />, desc: "All major Indian banks" },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cart, cartTotal, currentUser, wallet, placeOrder, topUpWallet } = useStore();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    currentUser?.addresses.find((a) => a.isDefault) ?? currentUser?.addresses[0] ?? null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [_topupAmount, _setTopupAmount] = useState(0);
  const [mockPaymentLoading, setMockPaymentLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { addAddress } = useStore();
  const [newAddr, setNewAddr] = useState({ label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false });

  const subtotal = cartTotal();
  const tax = Math.round(subtotal * 0.05);
  const platformFee = 99;
  const total = subtotal + tax + platformFee;
  const walletBalance = wallet?.balance ?? 0;
  const walletShortfall = Math.max(0, total - walletBalance);

  const handleAddAddress = () => {
    if (!newAddr.fullName || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      showToast("Please fill required address fields", "error");
      return;
    }
    addAddress(newAddr);
    setShowAddressForm(false);
    showToast("Address added!", "success");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { showToast("Please select a delivery address", "error"); return; }

    setMockPaymentLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); // Simulate payment processing

    if (paymentMethod === "wallet" && walletBalance < total) {
      // Auto top-up shortfall
      topUpWallet(walletShortfall + 100, "UPI (Auto)");
    }

    const result = await placeOrder(selectedAddress, paymentMethod);
    setMockPaymentLoading(false);

    if (result.success) {
      showToast("🎉 Order placed successfully!", "success");
      navigate(`/orders/${result.orderId}`);
    } else {
      showToast(result.message, "error");
    }
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {(["address", "payment", "review"] as const).map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => { if (i < ["address", "payment", "review"].indexOf(step) + 1) setStep(s); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                step === s ? "bg-green-600 text-white" :
                i < ["address", "payment", "review"].indexOf(step) ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                "text-gray-400 dark:text-gray-600"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? "bg-white text-green-600" :
                i < ["address", "payment", "review"].indexOf(step) ? "bg-green-500 text-white" :
                "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}>
                {i < ["address", "payment", "review"].indexOf(step) ? <Check size={12} /> : i + 1}
              </span>
              <span className="hidden sm:block capitalize">{s}</span>
            </button>
            {i < 2 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {step === "address" && (
              <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-green-500" /> Delivery Address
                  </h2>
                  <div className="space-y-3 mb-4">
                    {currentUser?.addresses.map((addr) => (
                      <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedAddress?.id === addr.id ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}>
                        <input type="radio" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{addr.label}</span>
                            {addr.isDefault && <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Default</span>}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{addr.fullName} · {addr.phone}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} – {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => setShowAddressForm(!showAddressForm)} className="flex items-center gap-2 w-full p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors">
                      <Plus size={16} /> Add New Address
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAddressForm && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-3 mb-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                          {[
                            { key: "label", label: "Label", placeholder: "Home/Office" },
                            { key: "fullName", label: "Full Name*", placeholder: "Your name" },
                            { key: "phone", label: "Phone*", placeholder: "+91 9876543210" },
                            { key: "line1", label: "Address Line 1*", placeholder: "Flat/House No, Street" },
                            { key: "line2", label: "Address Line 2", placeholder: "Area, Landmark (optional)" },
                            { key: "city", label: "City*", placeholder: "City" },
                            { key: "state", label: "State*", placeholder: "State" },
                            { key: "pincode", label: "Pincode*", placeholder: "560001" },
                          ].map(({ key, label, placeholder }) => (
                            <div key={key} className={key === "line1" || key === "line2" ? "col-span-2" : ""}>
                              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
                              <input
                                type="text"
                                placeholder={placeholder}
                                value={(newAddr as unknown as Record<string, string>)[key] || ""}
                                onChange={(e) => setNewAddr((a) => ({ ...a, [key]: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                        <button onClick={handleAddAddress} className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">
                          Save Address
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => { if (!selectedAddress) { showToast("Select an address", "error"); return; } setStep("payment"); }}
                    className="mt-5 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
                  <div className="space-y-3 mb-5">
                    {PAYMENT_METHODS.map(({ id, label, icon, desc }) => (
                      <label key={id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        paymentMethod === id ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}>
                        <input type="radio" checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                          {id === "wallet" && (
                            <p className={`text-xs font-medium mt-0.5 ${walletBalance >= total ? "text-green-600" : "text-amber-600"}`}>
                              Balance: {formatCurrency(walletBalance)}
                              {walletBalance < total && ` (Need ₹${(total - walletBalance).toLocaleString()} more)`}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Wallet shortfall notice */}
                  {paymentMethod === "wallet" && walletShortfall > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        Insufficient wallet balance. We'll auto-top-up {formatCurrency(walletShortfall + 100)} via UPI when you place the order.
                      </p>
                    </div>
                  )}

                  {/* UPI Input */}
                  {paymentMethod === "upi" && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                        placeholder="yourname@upi or +91 number"
                      />
                      <p className="text-xs text-gray-400 mt-1">🔒 Mock payment — no real transaction will occur</p>
                    </div>
                  )}

                  {/* Card Input */}
                  {paymentMethod === "card" && (
                    <div className="mb-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Card Number</label>
                        <input
                          type="text"
                          value={cardNum}
                          onChange={(e) => setCardNum(e.target.value.replace(/\D/g, "").slice(0, 16))}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white font-mono"
                          placeholder="4111 1111 1111 1111"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Expiry</label>
                          <input type="text" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" placeholder="MM/YY" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">CVV</label>
                          <input type="password" maxLength={4} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" placeholder="•••" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">🔒 Mock payment — no real transaction will occur</p>
                    </div>
                  )}

                  <button
                    onClick={() => setStep("review")}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === "review" && (
              <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review Your Order</h2>
                  <div className="space-y-3 mb-5">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <img src={item.product.images[0]} alt={item.product.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.product.title}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery to:</h3>
                    {selectedAddress && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedAddress.fullName}, {selectedAddress.line1}, {selectedAddress.city} – {selectedAddress.pincode}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 capitalize">Payment: {paymentMethod}</p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={mockPaymentLoading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-green-600/20"
                  >
                    {mockPaymentLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Place Order · {formatCurrency(total)}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Price Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">GST (5%)</span><span className="font-medium">{formatCurrency(tax)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Platform Fee</span><span className="font-medium">{formatCurrency(platformFee)}</span></div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2.5 flex justify-between font-bold text-base">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
