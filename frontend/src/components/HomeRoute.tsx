import { useAuth } from "@/contexts/AuthContext";
import CompanyDashboard from "@/pages/company/CompanyDashboard";
import CompanyLanding from "@/pages/company/Landing";
import { AuthGuard } from "@/components/company/dashboard/AuthGuard";

export const HomeRoute = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If user is logged in, show the protected dashboard
    // We wrap it in AuthGuard just to be safe and consistent, 
    // although currentUser check here is basically doing the same.
    if (currentUser) {
        return (
            <AuthGuard>
                <CompanyDashboard />
            </AuthGuard>
        );
    }

    // If not logged in, show the public landing page
    return <CompanyLanding />;
};
