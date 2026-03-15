"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("customers")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (data) setCustomers(data);
      setLoading(false);
    }

    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      <Header title="Customers" />
      
      <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filter
            </button>
            <Link href="/dashboard/customers/add" className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add</span>
              Add Customer
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website URL</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                   <tr>
                     <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                     </td>
                   </tr>
                ) : customers.length > 0 ? customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{customer.email}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-bold">{customer.package}</td>
                    <td className="px-6 py-4 text-sm text-primary font-medium hover:underline cursor-pointer truncate max-w-[150px]">
                        {customer.website_url ? `weddingweb.in/${customer.website_url}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        customer.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        customer.status.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!loading && customers.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Showing {customers.length} results</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm font-bold text-slate-400 cursor-not-allowed border border-slate-100 dark:border-slate-800 rounded-lg">Previous</button>
                <button className="px-3 py-1 text-sm font-bold text-white bg-primary rounded-lg shadow-sm">1</button>
                <button className="px-3 py-1 text-sm font-bold text-slate-400 cursor-not-allowed border border-slate-100 dark:border-slate-800 rounded-lg">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
