import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, LogIn, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CompanyNavbar } from './CompanyNavbar';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <CompanyNavbar />

                <main className="container max-w-2xl mx-auto px-4 py-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl border border-slate-200"
                    >
                        <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <Lock className="w-10 h-10 text-rose-500" />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-4">Restricted Access</h1>
                        <p className="text-slate-500 text-lg mb-10">
                            Please login to access your WeddingWeb account and manage your personalized dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/company/login">
                                <Button className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-8 h-12 text-lg rounded-xl shadow-lg shadow-rose-200 transition-all hover:scale-105">
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Login to Access
                                </Button>
                            </Link>

                            <Link to="/about-platform">
                                <Button variant="outline" className="w-full sm:w-auto px-8 h-12 text-lg rounded-xl border-slate-200 hover:bg-slate-50">
                                    Learn More
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    return <>{children}</>;
};
