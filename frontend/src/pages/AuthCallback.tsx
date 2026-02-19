import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during auth callback:', error.message);
                navigate('/company/login', { state: { error: error.message } });
                return;
            }

            if (data?.session) {
                // Determine redirect path based on user role/metadata
                const user = data.session.user;
                const role = user.user_metadata?.role || 'user';

                if (role === 'photographer') {
                    navigate('/photographer');
                } else if (role === 'couple') {
                    navigate('/couple');
                } else {
                    navigate('/company');
                }
            } else {
                navigate('/');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold text-slate-800">Finalizing Authentication...</h2>
            <p className="text-slate-500">Please wait while we redirect you.</p>
        </div>
    );
};

export default AuthCallback;
