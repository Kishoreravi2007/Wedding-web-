"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: "Total Customers", value: "0", change: "+0%", status: "none", icon: "groups", color: "text-primary", bg: "bg-primary/10" },
    { name: "Active Customers", value: "0", change: "Steady", status: "none", icon: "monitoring", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { name: "Completed Websites", value: "0", change: "+0%", status: "none", icon: "task_alt", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { name: "Pending Customers", value: "0", change: "Priority", status: "none", icon: "pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  ]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Stats
      const { data: customers } = await supabase
        .from("customers")
        .select("status")
        .eq("vendor_id", user.id);

      if (customers) {
        const total = customers.length;
        const active = customers.filter(c => c.status === 'active' || c.status === 'Active').length;
        const completed = customers.filter(c => c.status === 'completed' || c.status === 'Completed').length;
        const pending = customers.filter(c => c.status === 'pending' || c.status === 'Pending').length;

        setStats(prev => [
          { ...prev[0], value: total.toString() },
          { ...prev[1], value: active.toString() },
          { ...prev[2], value: completed.toString() },
          { ...prev[3], value: pending.toString() },
        ]);
      }

      // Fetch Recent Customers
      const { data: recent } = await supabase
        .from("customers")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recent) setRecentCustomers(recent);
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  return (
    <>
      <Header title="Dashboard" />
      
      <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                    </div>
                    <span className={`text-xs font-bold ${stat.status === 'up' ? 'text-green-500' : 'text-slate-400'}`}>
                      {stat.status === 'up' && '+'}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.name}</p>
                  <h3 className="text-slate-900 dark:text-white text-3xl font-extrabold mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">Recent Customers</h3>
                <button className="text-primary text-sm font-bold hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Package</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentCustomers.length > 0 ? recentCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-lg">favorite</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            customer.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            customer.status.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-bold text-right">{customer.package}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
