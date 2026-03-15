"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    referral_code: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("vendors").select("*").eq("id", user.id).single();
        if (data) setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("vendors")
        .update({ name: profile.name })
        .eq("id", user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header title="Vendor Profile" />
      
      <div className="p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="relative h-32 bg-primary/10">
            <div className="absolute -bottom-10 left-10">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg">
                <div 
                  className="w-full h-full rounded-xl bg-slate-200 bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')" }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-10 px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Elite Professional Vendor</p>
              </div>
              <button className="px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all text-sm">
                Change Photo
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Public Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                  />
                </div>
                <div className="space-y-2 opacity-60">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address (Locked)</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Referral Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={profile.referral_code}
                      disabled
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-500 outline-none"
                    />
                    <button type="button" className="px-3 text-primary hover:bg-primary/5 rounded-lg">
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Joined On</label>
                  <p className="px-4 py-3 text-sm text-slate-500 font-medium">March 15, 2026</p>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex flex-col gap-4">
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium border ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/20' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20'
                  }`}>
                    {message.text}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button type="button" className="px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
