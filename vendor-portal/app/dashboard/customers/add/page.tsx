"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    package: "Premium",
    website_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.name || !formData.email) {
        throw new Error("Name and Email are required");
      }

      if (formData.phone && !/^\+?[0-9\s-]{10,}$/.test(formData.phone)) {
        throw new Error("Please enter a valid phone number");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("customers").insert([
        { 
          ...formData, 
          vendor_id: user.id,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: "Customer added successfully!" });
      setFormData({
        name: "",
        email: "",
        phone: "",
        package: "Premium",
        website_url: "",
      });
      
      setTimeout(() => router.push("/dashboard/customers"), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Failed to add customer" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Add Customer" />
      
      <div className="p-8 flex flex-col gap-8 max-w-3xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Customer Information</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the details to register a new customer.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Customer Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Sarah & James"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Package Type</label>
                <select 
                  value={formData.package}
                  onChange={(e) => setFormData({...formData, package: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Website URL (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">weddingweb.in/</span>
                <input 
                  type="text" 
                  placeholder="sarah-james"
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  className="w-full pl-32 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium border ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/20' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Adding..." : "Add Customer"}
                {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
