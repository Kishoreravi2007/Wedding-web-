

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/api';

export default function Settings() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, refreshUser } = useAuth();
    const [telemetry, setTelemetry] = useState(false);
    const [encryption, setEncryption] = useState(false);
    const [avatar, setAvatar] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuA49t2CuLcUYubZ4cYoXAThYoQdaSxWtyH14c_wrM6RGpWXxCesa7pXk7aJkglwTX63D4bIBjDbwjQPRZ7Ult1VEpCMs4g0SxXYGT_01FPO2f1gNNqqkAXmfr2w0Lz12Tj_nz39osEO0Nshy2xfid2FFMMRt6FUwjC8ASNix4ZLHzxDPd7O6H9Sc1dpLipHE32czwmrzZbWM34gyFEG8CiPGAqqRwWiQEjzTeu9-oZA8Rw2taR_u_oubbJLPhc2D37JazyQ8Bmhvnmm");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch actual profile on mount
    useEffect(() => {
        if (user?.avatar_url) {
            setAvatar(user.avatar_url);
        } else if (user?.id) {
            profileService.getProfile(user.id).then(data => {
                if (data && data.avatar_url) {
                    setAvatar(data.avatar_url);
                }
            }).catch(err => console.error("Failed to load profile", err));
        }
    }, [user]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Show optimistic preview
            const previewUrl = URL.createObjectURL(file);
            const oldAvatar = avatar;
            setAvatar(previewUrl);
            setIsUploading(true);

            try {
                const result = await profileService.uploadAvatar(file);
                if (result.avatar_url) {
                    setAvatar(result.avatar_url);
                    await refreshUser(); // Update global state
                    alert("Profile image updated successfully.");
                }
            } catch (err) {
                console.error("Upload failed", err);
                setAvatar(oldAvatar);
                alert("Failed to upload image.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleCommit = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Protocol changes committed to network.");
        }, 1500);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight transition-colors">Core Config</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">Personnel & System Parameters</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Profile Identity */}
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group transition-all">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400 mb-8 pl-1">Authorized Personnel</h3>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group/avatar">
                            <div className="size-28 rounded-[2rem] bg-white/5 overflow-hidden border border-white/10 group-hover:border-primary/40 transition-all p-1">
                                <img
                                    src={avatar}
                                    className={`w-full h-full object-cover rounded-[1.8rem] transition-all ${isUploading ? 'opacity-40 blur-sm' : 'opacity-80 group-hover/avatar:opacity-100'}`}
                                    alt="Admin Avatar"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute -bottom-2 -right-2 size-10 rounded-xl bg-primary text-black flex items-center justify-center shadow-neon-blue hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">edit_square</span>
                            </button>
                        </div>

                        <div className="text-center md:text-left">
                            <h4 className="text-2xl font-black dark:text-white text-slate-900 tracking-tighter uppercase transition-colors">
                                {user?.full_name || user?.username || "Kishore Ravi"}
                            </h4>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                                {user?.role === 'admin' ? 'Super Admin Protocol Class v4' : 'Staff Access Protocol'}
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 mt-4">
                                <div className="glass-card px-4 py-2 rounded-xl border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Digital Address</p>
                                    <p className="text-[10px] font-bold dark:text-white text-slate-700 transition-colors">
                                        {user?.email || "admin@weddingweb.co.in"}
                                    </p>
                                </div>
                                <div className="glass-card px-4 py-2 rounded-xl border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Network Cluster</p>
                                    <p className="text-[10px] font-bold dark:text-white text-slate-700 transition-colors">Mumbai-HQ-01</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Preferences */}
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400 mb-8 pl-1">Global Overrides</h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/5 group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:shadow-neon-blue transition-all">
                                    <span className="material-symbols-outlined">dark_mode</span>
                                </div>
                                <div>
                                    <p className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-tight transition-colors">Dark Mode Matrix</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enable high-contrast night vision</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-14 h-7 rounded-full relative p-1.5 transition-all ${isDarkMode ? 'bg-primary shadow-neon-blue' : 'bg-slate-200 border border-slate-300'}`}
                            >
                                <div className={`size-4 bg-black rounded-full transition-all ${isDarkMode ? 'ml-auto' : 'ml-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/5 group hover:border-secondary/20 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:shadow-neon-purple transition-all">
                                    <span className="material-symbols-outlined">sensors</span>
                                </div>
                                <div>
                                    <p className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-tight transition-colors">Real-time Telemetry</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Push notifications for new activity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setTelemetry(!telemetry)}
                                className={`w-14 h-7 rounded-full relative p-1.5 transition-all ${telemetry ? 'bg-secondary shadow-neon-purple' : 'bg-slate-200 border border-slate-300'}`}
                            >
                                <div className={`size-4 bg-black rounded-full transition-all ${telemetry ? 'ml-auto' : 'ml-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/5 group hover:border-red-500/20 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 transition-all">
                                    <span className="material-symbols-outlined">security</span>
                                </div>
                                <div>
                                    <p className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-tight transition-colors">Advanced Encryption</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Force 256-bit AES on all uplinks</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEncryption(!encryption)}
                                className={`w-14 h-7 rounded-full relative p-1.5 transition-all ${encryption ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-slate-200 border border-slate-300'}`}
                            >
                                <div className={`size-4 bg-black rounded-full transition-all ${encryption ? 'ml-auto' : 'ml-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCommit}
                    disabled={isSaving}
                    className="w-full py-6 bg-gradient-to-r from-primary to-secondary text-black font-black rounded-[2rem] shadow-neon-blue hover:scale-[1.01] active:scale-95 transition-all text-xs tracking-[0.4em] uppercase disabled:opacity-50"
                >
                    {isSaving ? "Syncing Protocols..." : "Commit Protocol Changes"}
                </button>
            </div>
        </div>
    );
}
