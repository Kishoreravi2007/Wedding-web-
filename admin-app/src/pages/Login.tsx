import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://weddingweb.co.in/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username,
                password
            });

            const { token, user } = response.data;
            login(token, user);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Login Error:', err);
            const detailedError = err.response?.data?.message || err.message || 'Network error or invalid credentials';
            setError(detailedError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background-dark mesh-gradient p-6 font-display">
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative z-20">
                <div className="glass-card p-1 rounded-[2.5rem] bg-gradient-to-br from-white/20 to-white/5 shadow-2xl">
                    <div className="bg-[#0a0e17]/80 backdrop-blur-3xl rounded-[2.3rem] p-8 md:p-10 border border-white/5">
                        <div className="flex flex-col items-center mb-10">
                            <div className="size-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-neon-blue mb-6 scale-110 p-3 overflow-hidden">
                                <img src="./logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight text-center">WeddingWeb</h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mt-2">Administrative Console</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1">Username / Email</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="admin_id"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1">Secure Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-bold focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white py-5 rounded-2xl font-black text-lg shadow-neon-blue hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                ) : (
                                    <span className="group-hover:tracking-widest transition-all">SIGN IN TO PANEL</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Secure Environment v1.5.4</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
