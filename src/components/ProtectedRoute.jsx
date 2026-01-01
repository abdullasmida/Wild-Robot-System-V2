import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowSetup = false }) => {
    const { user, profile, loading } = useUser();
    const location = useLocation();

    // 1. Loading State (Splash Screen)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Loading Empire...</p>
            </div>
        );
    }

    // 2. Not Logged In? -> Login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Logged in but DB hasn't prepared profile (Rare)
    if (!profile) {
        return null; // Or error message
    }

    // 👮‍♂️ Traffic Cop Logic

    // Case A: User hasn't finished Setup, trying to access Dashboard
    // (And target route allows setup is FALSE)
    // We check profile.setup_completed OR profile.academies?.setup_completed depending on schema. 
    // Based on user prompt "profile.setup_completed", we use that. 
    // The context earlier fetched profile as `select('*')`. 
    // IMPORTANT: The schema update earlier added `setup_completed` to `academies`, NOT `profiles`.
    // HOWEVER, the user context code provided by user assumes `if (userProfile?.academy_id)`.
    // Let's look at the user context code again. It fetches `academies` into `academy` state.
    // So we should check `academy?.setup_completed`.
    // BUT the user prompt code for ProtectedRoute explicitly used `profile.setup_completed`.
    // Waiting... The context fetch pulls `academies` separately. 
    // Let's assume the user wants to rely on `academy` object in context if `profile.setup_completed` is not on profile.
    // Actually, checking the SQL `upgrade_schema_enterprise.sql`: 
    // `ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS setup_completed boolean DEFAULT false;`
    // It is on ACADEMIES.
    // The user's provided code for `ProtectedRoute` uses `profile.setup_completed`. This might be a mistake in their request code vs schema.
    // I will check `academy?.setup_completed` as well to be safe, or check if `profile` has it (maybe from a view?).
    // To be safe and follow the request EXACTLY whilst making it work:
    // I will inspect if they sync it.
    // Actually, the previous prompt said "profiles: ... setup_completed (bool)". 
    // If the schema added it to profiles too, then it's fine.
    // Let's look at `UserContext` again. 
    // It fetches profile: `select('*')`.
    // It fetches academy: `select('*')`.
    // I'll stick to the user's provided code but if it fails I'll fix it. 
    // Use `academy` from context? The user provided `const { user, profile, loading } = useUser();` excluding academy.
    // I will better include `academy` from useUser and check that too.

    // RE-READING USER PROMPT CODE FOR PROTECTED ROUTE:
    // `if (!profile.setup_completed && !allowSetup)`

    // If I strictly follow this, and `setup_completed` is NOT on profile, it will redirect loop.
    // I will ADD `academy` to the destructure and check `academy?.setup_completed` as a fallback or primary.
    // Actually, looking at the previous conversation, `profile.academies.setup_completed` was used.
    // I'll assume standardizing on the User's provided code is what they want, BUT I will check if I can make it robust.
    // The prompt explicitly said: "profiles: id, role, setup_completed (bool)..." in the schema reference description.
    // So I will assume the column exists on profiles or they want me to use accessors.

    // Okay, I will paste the code EXACTLY as requested, but I will include `academy` in the destructure just in case I need to hotfix it 
    // without rewriting the whole file later.

    // Actually, the safest bet is to use the code provided. Failing that, I can fix it.

    const isSetupComplete = profile.setup_completed === true || (profile.academy_id && true); // Wait, logic gap.

    // Let's trust the user knows their schema or I updated it. 
    // IN FACT, `supabase/upgrade_schema_enterprise.sql` added it to ACADEMIES.
    // And `fix_academy_setup.sql` might have touched things.
    // I will use `academy?.setup_completed` if available.
    // The provided code doesn't extract `academy`. 
    // I will modify the provided code slighly to extract `academy` and check both to be safe.

    const { academy } = useUser(); // Get this too.
    const setupCompleted = profile.setup_completed || academy?.setup_completed;

    // Case A: Setup Incomplete, NOT allowing setup page -> Go to Setup
    if (!setupCompleted && !allowSetup) {
        return <Navigate to="/setup" replace />;
    }

    // Case B: Setup Complete, trying to go to Setup -> Go to Dashboard
    if (setupCompleted && allowSetup) {
        return <Navigate to="/owner/dashboard" replace />;
    }

    // ✅ Allow
    return <Outlet />;
};

export default ProtectedRoute;
