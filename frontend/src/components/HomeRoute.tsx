import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CompanyDashboard from "@/pages/company/CompanyDashboard";
// import CompanyLanding from "@/pages/company/Landing";
import LandingNew from "@/pages/company/LandingNew";
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

    if (currentUser) {
        return <Navigate to="/company" replace />;
    }

    // If not logged in, show the public landing page
    return <LandingNew />;
};
