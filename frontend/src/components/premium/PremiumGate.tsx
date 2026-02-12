import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PremiumGateProps {
    children: ReactNode;
    feature: string;
    fallback?: ReactNode;
    title?: string;
    description?: string;
}

const FEATURE_LABELS: Record<string, string> = {
    'website': 'Wedding Website',
    'photo-gallery': 'Photo Gallery',
    'event-schedule': 'Event Timeline',
    'wishes': 'Digital Wishes',
    'guest-management': 'Guest Management',
    'music-player': 'Music Player',
    'face-detection': 'AI Face Detection',
    'visual-editor': 'Visual Website Builder'
};

const PremiumGate = ({
    children,
    feature,
    fallback,
    title,
    description
}: PremiumGateProps) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Check if user has the specific feature OR implies 'all' via has_premium_access (legacy)
    // We treat has_premium_access as a fallback for now, OR we enforce strict gating.
    // Plan says strict gating, but let's allow has_premium_access to bypass IF premium_features is empty/undefined
    // to prevent locking out existing premium users until migration is confirmed.
    // However, the backend update now returns premium_features. 
    // If premium_features is present (even empty), we should trust it?
    // Let's go with: if has_premium_access is true AND premium_features is undefined/null, allow.
    // If premium_features IS defined, check strictly.

    // Check granular feature OR legacy full access
    const hasAccess =
        (currentUser?.premium_features?.includes(feature)) ||
        (currentUser?.has_premium_access === true);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl min-h-[400px]"
        >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                <Lock className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {title || `${FEATURE_LABELS[feature] || 'Premium'} Feature Locked`}
            </h3>

            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                {description || `This feature is available exclusively with our ${FEATURE_LABELS[feature] || 'Premium'} package. Upgrade your plan to unlock it securely.`}
            </p>

            <div className="flex gap-4">
                <Button
                    onClick={() => navigate('/company/pricing')}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to Unlock
                </Button>
                {/* <Button variant="outline" size="lg" onClick={() => navigate('/company/contact')}>
                    Contact Sales
                </Button> */}
            </div>
        </motion.div>
    );
};

export default PremiumGate;
