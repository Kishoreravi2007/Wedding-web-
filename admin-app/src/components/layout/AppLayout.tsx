import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isDarkMode } = useTheme();

    return (
        <div className={`relative flex h-screen w-full overflow-hidden font-display transition-colors duration-500 ${isDarkMode ? 'bg-background-dark mesh-gradient' : 'bg-slate-50'}`}>
            {!isDarkMode && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05)_0%,rgba(0,0,0,0)_50%)]"></div>
            )}
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <TopBar />
                <main className="flex-1 overflow-y-auto hide-scrollbar p-5 md:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
