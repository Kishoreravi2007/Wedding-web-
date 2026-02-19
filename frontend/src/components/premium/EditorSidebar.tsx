
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Palette, Layout, Settings, Eye, EyeOff, Type, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { themeConfigs } from '@/lib/themeConfig';

interface EditorSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    weddingData: any;
    onUpdateCustomization: (key: string, value: string) => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
    isOpen,
    onClose,
    weddingData,
    onUpdateCustomization
}) => {
    const customizations = weddingData.customizations || {};
    const activeTheme = weddingData.theme;

    // Sections that can be toggled
    const sections = [
        { id: 'hero', label: 'Hero / Cover' },
        { id: 'timeline', label: 'Schedule & Timeline' },
        { id: 'gallery', label: 'Photo Gallery' },
        { id: 'travel', label: 'Travel & Logistics' },
        { id: 'wishes', label: 'Wishes Wall' },
        { id: 'registry', label: 'Gift Registry' },
    ];

    const isSectionHidden = (id: string) => customizations[`hide_${id}`] === 'true';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[350px] bg-white shadow-2xl z-[70] flex flex-col border-l border-slate-200"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                <Settings className="w-5 h-5 text-indigo-500" />
                                Design Designer
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* Theme Selection */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layout className="w-4 h-4" />
                                    Active Theme
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <button className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-indigo-100 text-left group transition-all">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{activeTheme}</p>
                                            <p className="text-[10px] text-indigo-500 font-medium tracking-wide leading-none mt-1">
                                                {themeConfigs[activeTheme]?.designerVersion === 3 ? 'PREMIUM DESIGNER' : 'LEGACY STITCHED'}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                                    </button>
                                </div>
                            </section>

                            {/* Section Visibility */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    Page Sections
                                </h3>
                                <div className="space-y-2">
                                    {sections.map(section => (
                                        <div key={section.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent transition-colors">
                                            <span className={`text-sm font-medium ${isSectionHidden(section.id) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {section.label}
                                            </span>
                                            <button
                                                onClick={() => onUpdateCustomization(`hide_${section.id}`, isSectionHidden(section.id) ? 'false' : 'true')}
                                                className={`p-1.5 rounded-lg transition-colors ${isSectionHidden(section.id) ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}
                                            >
                                                {isSectionHidden(section.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Global Styles */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    Global Styles
                                </h3>
                                <div className="space-y-4">
                                    {/* Accent Color */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Accent Color</label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {['#F43F5E', '#D4AF37', '#2D5A27', '#1754CF', '#6366F1', '#111827'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => onUpdateCustomization('accentColor', color)}
                                                    className="aspect-square rounded-full border-2 border-white ring-1 ring-slate-200 flex items-center justify-center overflow-hidden"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {customizations.accentColor === color && <Check className="w-3 h-3 text-white drop-shadow-sm" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Font Choice */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Typography</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['font-serif', 'font-sans'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => onUpdateCustomization('globalFont', f)}
                                                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${customizations.globalFont === f ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                >
                                                    <Type className="w-4 h-4 inline-block mr-2" />
                                                    {f.replace('font-', '').charAt(0).toUpperCase() + f.slice(6)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                                Changes are saved automatically
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditorSidebar;
