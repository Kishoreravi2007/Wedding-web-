"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 mb-8 border border-red-100 dark:border-red-900/20">
        <span className="material-symbols-outlined text-red-500 text-6xl">warning</span>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Something went wrong</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-lg">
        An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => reset()}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">refresh</span>
          Try Again
        </button>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="px-8 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
