import React from 'react';
import { LayoutGrid, List, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
    activeView: 'dashboard' | 'queue' | 'settings';
    onViewChange: (view: 'dashboard' | 'queue' | 'settings') => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
    return (
        <nav className="w-64 glass-panel border-r border-glass-border flex flex-col p-6 z-40 h-full backdrop-blur-xl">
            <div className="mb-10 px-2">
                <div className="text-[10px] uppercase tracking-tighter text-gray-500 mb-6 font-bold">Navigation</div>
                <ul className="space-y-4">
                    <li>
                        <button
                            onClick={() => onViewChange('dashboard')}
                            className={`w-full flex items-center gap-3 group transition-all ${activeView === 'dashboard' ? 'text-accent-gold' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-all ${activeView === 'dashboard' ? 'bg-accent-gold/10' : 'bg-white/5 group-hover:bg-white/10'
                                }`}>
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <span className="font-medium">Dashboard</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => onViewChange('queue')}
                            className={`w-full flex items-center gap-3 group transition-all ${activeView === 'queue' ? 'text-primary-orange' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-all ${activeView === 'queue' ? 'bg-primary-orange/10' : 'bg-white/5 group-hover:bg-white/10'
                                }`}>
                                <List className="w-5 h-5" />
                            </div>
                            <span className="font-medium">Queue</span>
                        </button>
                    </li>
                </ul>
            </div>

            <div className="mt-auto px-2 pb-4 space-y-4">
                <button
                    onClick={() => onViewChange('settings')}
                    className={`w-full flex items-center gap-3 group transition-all ${activeView === 'settings' ? 'text-accent-gold' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all ${activeView === 'settings' ? 'bg-accent-gold/10' : 'bg-white/5 group-hover:bg-white/10'
                        }`}>
                        <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Settings</span>
                </button>

                <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Support</span>
                </button>
            </div>
        </nav>
    );
}
