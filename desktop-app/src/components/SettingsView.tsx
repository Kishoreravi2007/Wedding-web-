import React from 'react';
import { Info, User, Settings as SettingsIcon, HelpCircle, Shield, Folder, Save, Search, Bell } from 'lucide-react';

interface SettingsViewProps {
    config: any;
    apiKeyValid: boolean | null;
    weddings: any[];
    onSaveConfig: (updates: any) => void;
    onSelectFolder: () => void;
}

export default function SettingsView({
    config,
    apiKeyValid,
    weddings,
    onSaveConfig,
    onSelectFolder
}: SettingsViewProps) {
    return (
        <main className="flex-1 overflow-y-auto bg-transparent relative animate-in slide-in-from-right-4 duration-500">
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 glass-panel border-b border-white/5 px-10 py-6 flex justify-between items-center backdrop-blur-xl">
                <div>
                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                    <p className="text-gray-400 text-sm">Configure your application and account preferences.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-10 space-y-12 pb-32">
                {/* General Section */}
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                        <Info className="w-5 h-5 text-primary-orange" />
                        General
                    </h3>
                    <div className="grid gap-4">
                        <div className="glass-panel rounded-xl p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-200">App Version</p>
                                <p className="text-sm text-gray-500">v2.0.4-PRO (Latest version)</p>
                            </div>
                            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors text-gray-300">
                                Check for Updates
                            </button>
                        </div>

                        <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
                            <p className="font-medium text-gray-200">Network Configuration</p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Endpoint URL</label>
                                    <input
                                        type="text"
                                        value={config.apiBaseUrl}
                                        onChange={(e) => onSaveConfig({ apiBaseUrl: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-orange/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                        <User className="w-5 h-5 text-primary-orange" />
                        Identity & Authorization
                    </h3>
                    <div className="glass-panel rounded-xl overflow-hidden divide-y divide-white/5">
                        <div className="p-6 flex items-center gap-6">
                            <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-primary-orange/30 bg-primary-orange/10 flex items-center justify-center">
                                <Shield className="w-10 h-10 text-primary-orange" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="text-lg font-semibold text-white">Photographer Account</h4>
                                <p className="text-sm text-gray-400">Authenticated Session Active</p>
                                <div className="flex gap-2 pt-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-orange/10 text-primary-orange border border-primary-orange/20">PRO PLAN</span>
                                    {apiKeyValid && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-green/10 text-success-green border border-success-green/20">AUTHORIZED</span>}
                                </div>
                            </div>
                            <button className="px-5 py-2.5 bg-primary-orange text-white rounded-lg font-bold text-sm shadow-lg shadow-primary-orange/20 hover:opacity-90 transition-opacity">
                                Portal Login
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Access Signature (API Key)</label>
                                    {apiKeyValid !== null && (
                                        <span className={`text-[9px] font-black uppercase ${apiKeyValid ? 'text-success-green' : 'text-error-red'}`}>
                                            {apiKeyValid ? 'Authorized' : 'Invalid Signature'}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    value={config.apiKey || ''}
                                    onChange={(e) => onSaveConfig({ apiKey: e.target.value })}
                                    placeholder="Paste your access token..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-orange/50 transition-all font-mono"
                                />
                            </div>

                            {weddings.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Active Assignment</label>
                                    <select
                                        value={config.eventId || ''}
                                        onChange={(e) => onSaveConfig({ eventId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-primary-orange/50 appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="" className="bg-dark-bg italic">Select Wedding Assignment...</option>
                                        {weddings.map((wedding) => (
                                            <option key={wedding.id} value={wedding.id} className="bg-dark-bg">
                                                {wedding.bride_name} & {wedding.groom_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Advanced Section */}
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                        <SettingsIcon className="w-5 h-5 text-primary-orange" />
                        Advanced
                    </h3>
                    <div className="glass-panel rounded-xl p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Local Cache Directory</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        readOnly
                                        value={config.watchedFolder || 'No folder selected'}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-orange/50 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={onSelectFolder}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium text-sm text-white"
                                >
                                    Browse
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Support Section */}
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                        <HelpCircle className="w-5 h-5 text-primary-orange" />
                        Support
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SupportCard icon={<Shield />} label="Security" description="Learn about encryption" />
                        <SupportCard icon={<HelpCircle />} label="Help Center" description="Common questions" />
                        <SupportCard icon={<Info />} label="About" description="Version information" />
                    </div>
                </section>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 right-0 left-64 glass-panel border-t border-white/10 p-6 flex justify-end gap-4 z-20 backdrop-blur-xl">
                <button className="px-10 py-2.5 rounded-lg bg-primary-orange text-white font-bold shadow-lg shadow-primary-orange/30 hover:opacity-90 transition-all flex items-center gap-2">
                    <Save className="w-5 h-5" /> Save Configuration
                </button>
            </div>
        </main>
    );
}

function SupportCard({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
    return (
        <button className="glass-panel p-6 rounded-xl text-center group hover:bg-white/5 transition-all border border-white/10">
            <div className="text-primary-orange mb-3 flex justify-center">{icon}</div>
            <span className="font-bold block text-white">{label}</span>
            <span className="text-xs text-gray-500">{description}</span>
        </button>
    );
}
