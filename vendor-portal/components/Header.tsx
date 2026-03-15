"use client";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 w-full">
      <div>
        <h2 className="text-slate-900 dark:text-white text-xl font-bold">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">Alex Rivera</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Elite Vendor</p>
          </div>
          <div 
            className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100 dark:border-slate-700" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')" }}
          ></div>
        </div>
      </div>
    </header>
  );
}
