import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Trash2, Plus, Shield, Edit2, Check, Home, Briefcase } from "lucide-react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/Toast";

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, addAddress, deleteAddress, setDefaultAddress } = useStore();
  const { showToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState({ name: currentUser?.name ?? "", email: currentUser?.email ?? "", phone: currentUser?.phone ?? "" });
  const [newAddr, setNewAddr] = useState({ label: "Home", fullName: currentUser?.name ?? "", phone: currentUser?.phone ?? "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false });

  if (!currentUser) return null;

  const handleSaveProfile = () => {
    updateProfile({ name: form.name, phone: form.phone });
    setEditMode(false);
    showToast("Profile updated!", "success");
  };

  const handleAddAddress = () => {
    if (!newAddr.fullName || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      showToast("Please fill all required fields", "error");
      return;
    }
    addAddress(newAddr);
    setShowAddressForm(false);
    setNewAddr({ label: "Home", fullName: currentUser.name, phone: currentUser.phone ?? "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false });
    showToast("Address saved!", "success");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=16a34a&color=fff&size=80`}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </span>
            </div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{currentUser.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{currentUser.email}</p>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full capitalize">
              <Shield size={11} />
              {currentUser.role}
            </span>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
              <p className="text-gray-400">Member since</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{new Date(currentUser.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white">Personal Information</h2>
              <button
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editMode ? "bg-green-600 text-white" : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                {editMode ? <><Check size={14} />Save Changes</> : <><Edit2 size={14} />Edit</>}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Full Name", key: "name", value: form.name },
                { icon: Mail, label: "Email", key: "email", value: form.email, disabled: true },
                { icon: Phone, label: "Phone Number", key: "phone", value: form.phone },
              ].map(({ icon: Icon, label, key, value, disabled }) => (
                <div key={key} className={key === "email" ? "" : ""}>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">{label}</label>
                  <div className="relative">
                    <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      disabled={!editMode || disabled}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <Plus size={14} />
                Add New
              </button>
            </div>

            {showAddressForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { key: "label", label: "Label", placeholder: "Home/Office", span: 1 },
                    { key: "fullName", label: "Full Name*", placeholder: "Recipient name", span: 1 },
                    { key: "phone", label: "Phone*", placeholder: "+91 XXXXXXXXXX", span: 1 },
                    { key: "line1", label: "Address Line 1*", placeholder: "Flat, House No, Street", span: 2 },
                    { key: "line2", label: "Address Line 2", placeholder: "Area, Landmark (optional)", span: 2 },
                    { key: "city", label: "City*", placeholder: "City", span: 1 },
                    { key: "state", label: "State*", placeholder: "State", span: 1 },
                    { key: "pincode", label: "Pincode*", placeholder: "560001", span: 1 },
                  ].map(({ key, label, placeholder, span }) => (
                    <div key={key} className={span === 2 ? "col-span-2" : ""}>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={(newAddr as unknown as Record<string, string>)[key] || ""}
                        onChange={(e) => setNewAddr((a) => ({ ...a, [key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3 cursor-pointer">
                  <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr((a) => ({ ...a, isDefault: e.target.checked }))} className="accent-green-600" />
                  Set as default address
                </label>
                <div className="flex gap-3">
                  <button onClick={handleAddAddress} className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">Save Address</button>
                  <button onClick={() => setShowAddressForm(false)} className="px-5 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                </div>
              </motion.div>
            )}

            {currentUser.addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No addresses saved yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentUser.addresses.map((addr) => (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-xl border-2 transition-colors ${addr.isDefault ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {addr.label === "Home" ? <Home size={16} className="text-green-500" /> : <Briefcase size={16} className="text-blue-500" />}
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Default</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button onClick={() => { setDefaultAddress(addr.id); showToast("Default address updated", "success"); }} className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium">
                            Set Default
                          </button>
                        )}
                        <button onClick={() => { deleteAddress(addr.id); showToast("Address removed", "info"); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{addr.fullName} · {addr.phone}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{addr.city}, {addr.state} – {addr.pincode}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
