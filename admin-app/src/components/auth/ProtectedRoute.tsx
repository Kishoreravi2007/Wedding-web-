import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-dark mesh-gradient">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-neon-blue animate-pulse">
                        <span className="material-symbols-outlined text-primary text-3xl animate-spin">favorite</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
