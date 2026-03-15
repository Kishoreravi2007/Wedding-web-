"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-primary/10 rounded-3xl p-6 mb-8">
        <span className="material-symbols-outlined text-primary text-6xl">error</span>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-lg">
        The page you are looking for might have been moved, deleted, or never existed for this professional portal.
      </p>
      <Link 
        href="/dashboard" 
        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined">dashboard</span>
        Back to Dashboard
      </Link>
    </div>
  );
}
