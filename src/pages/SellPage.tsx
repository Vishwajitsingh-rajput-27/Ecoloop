import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Plus, X, Leaf, Package, AlertCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";
import { categories } from "../data/mockData";
import type { ProductCondition } from "../types";

const CONDITIONS: ProductCondition[] = ["New", "Like New", "Refurbished", "For Parts Only"];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
];

export const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addProduct, currentUser } = useStore();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([{ label: "", value: "" }]);
  const [form, setForm] = useState({
    title: "", description: "", brand: "", categoryId: "cat1", condition: "Refurbished" as ProductCondition,
    age: 1, purchaseYear: new Date().getFullYear() - 1, price: "", originalPrice: "",
    quantity: 1, city: "", state: "", tags: "",
  });

  const handleAddImage = () => {
    // In production, this would open file picker / upload to S3
    const url = PLACEHOLDER_IMAGES[images.length % PLACEHOLDER_IMAGES.length];
    setImages((prev) => [...prev, url]);
    showToast("Image added (demo – using placeholder)", "info");
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price || !form.city) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (images.length === 0) { showToast("Add at least one image", "error"); return; }

    const cat = categories.find((c) => c.id === form.categoryId);
    const result = await addProduct({
      title: form.title,
      description: form.description,
      brand: form.brand || "Other",
      categoryId: form.categoryId,
      categoryName: cat?.name ?? "Other",
      condition: form.condition,
      age: Number(form.age),
      purchaseYear: Number(form.purchaseYear),
      specs: specs.filter((s) => s.label && s.value),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      quantity: Number(form.quantity),
      images: images.length > 0 ? images : [PLACEHOLDER_IMAGES[0]],
      location: { city: form.city, state: form.state },
      sellerId: currentUser?.id ?? "",
      sellerName: currentUser?.name ?? "",
      sellerRating: currentUser?.sellerRating ?? 4.5,
      ecoImpact: { kgDiverted: 0.2 * Number(form.age), co2Saved: 50 * Number(form.age) },
      tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      isActive: true,
    });

    if (result.success && result.product) {
      showToast("🎉 Your listing is live!", "success");
      navigate(`/products/${result.product.id}`);
    } else {
      showToast(result.message || "Failed to create listing.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">List Your Device</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Sell your old electronics and help the environment</p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {["Details", "Specs & Pricing", "Photos"].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2 ${step > i + 1 ? "text-green-600" : step === i + 1 ? "text-green-700 dark:text-green-400" : "text-gray-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{label}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />}
          </React.Fragment>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6"
      >
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Product Details</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Product Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. iPhone 12 Pro Max 256GB Pacific Blue" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Describe the condition, what's included, any defects..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Apple, Samsung..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Condition *</label>
                <select value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as ProductCondition }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Age (years)</label>
                <input type="number" min={0} max={20} value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Mumbai" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">State</label>
                <input type="text" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Maharashtra" />
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
              Next: Specs & Pricing →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Specs & Pricing</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Specifications</label>
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" value={spec.label} onChange={(e) => { const s = [...specs]; s[i].label = e.target.value; setSpecs(s); }} className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Storage" />
                  <input type="text" value={spec.value} onChange={(e) => { const s = [...specs]; s[i].value = e.target.value; setSpecs(s); }} className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 256GB" />
                  {specs.length > 1 && <button onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><X size={16} /></button>}
                </div>
              ))}
              <button onClick={() => setSpecs([...specs, { label: "", value: "" }])} className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 hover:underline">
                <Plus size={14} /> Add Spec
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Your Price (₹) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="25000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Original MRP (₹)</label>
                <input type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="70000 (optional)" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Quantity</label>
                <input type="number" min={1} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="apple, iphone, 5g" />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Leaf size={16} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-400">
                Estimated eco impact: <strong>{(0.2 * form.age).toFixed(1)}kg</strong> e-waste diverted, <strong>{50 * form.age}kg CO₂</strong> saved
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
                Next: Photos →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Product Photos</h2>
            <div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md">
                      <X size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-md font-medium">Main</span>}
                  </div>
                ))}
                {images.length < 5 && (
                  <button onClick={handleAddImage} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors">
                    <Upload size={24} />
                    <span className="text-xs font-medium">Add Photo</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">Up to 5 photos. First photo is the main image. (Demo: adds placeholder images)</p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-400">
                <p className="font-semibold mb-1">Before listing, make sure to:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Include clear, well-lit photos from multiple angles</li>
                  <li>Disclose all defects, scratches, or issues honestly</li>
                  <li>Include any accessories or original packaging</li>
                  <li>Factory reset and remove all personal data</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                ← Back
              </button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-green-600/20"
              >
                <Package size={18} />
                Publish Listing
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
