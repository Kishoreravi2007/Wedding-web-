"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const navItems = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Customers", href: "/customers", icon: "group" },
  { name: "Add Customer", href: "/customers/add", icon: "person_add" },
  { name: "Referral Link", href: "/referral", icon: "link" },
  { name: "Profile", href: "/profile", icon: "account_circle" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 h-screen">
      <div className="p-6 flex flex-col h-full justify-between">
        <div className="flex flex-col gap-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-2">
              <span className="material-symbols-outlined text-primary text-2xl">loyalty</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-none">Wedding Web</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Vendor Portal</p>
            </div>
          </div>
          
          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive 
                      ? "bg-primary text-white shadow-sm shadow-primary/20" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left w-full"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
