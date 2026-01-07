import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowSetup?: boolean;
}

const ProtectedRoute = ({ allowSetup = false }: ProtectedRouteProps) => {
    const location = useLocation();
    const { user: profile, loading } = useAuthStore();

    // Recheck session if loading loops or is stuck, but normally useAuthStore handles this on mount/refresh
    // For now, assume global loader in Layout or App handles init check, but here we show spinner if still loading
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Loading Wild Robot...</p>
            </div>
        );
    }

    // 1. Not Logged In
    if (!profile) {
        // Double check session existence just in case store 'user' is null but session exists (rare sync issue)
        // But better to rely on store 'user' which signifies "Profile Loaded".
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Setup Logic
    // Inspect profile and academy status
    const isSetupComplete = !!profile.setup_completed; // Cast to boolean to avoid undefined issues

    // Case A: Setup NOT Complete -> Force them to /setup
    // Exception: If allowSetup is true, we let them stay (that's the setup route itself)
    if (!isSetupComplete && !allowSetup) {
        return <Navigate to="/setup" replace />;
    }

    // Case B: Setup IS Complete -> Force them OUT of /setup and into Dashboard
    if (isSetupComplete && allowSetup) {
        return <Navigate to="/owner/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
