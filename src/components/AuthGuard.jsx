import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuthStore } from '@/stores/useAuthStore'; // Utilize the store for speed if available
import { Loader2 } from 'lucide-react';

const STAFF_ROLES = ['owner', 'admin', 'manager', 'head_coach', 'coach'];

export const isStaffMember = (role) => STAFF_ROLES.includes(role);

const AuthGuard = ({ children, requiredZone = 'any', allowSetup = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // We can use the store to get the user initially, but we might verify with DB for critical checks
    // For now, let's trust Supabase session + DB Role check like before for robust security

    // Logic extraction for re-use
    const checkAuthorization = useCallback(async () => {
        try {
            // Optimistic: If we are already authorized, don't block UI with loading state during re-check
            // Unless we suspect a zone change that requires blocking?
            // For now, allow background check if `isAuthorized` is true.

            const { data: { session } } = await supabase.auth.getSession();

            // 1. Authentication Check
            if (!session) {
                // Determine redirect based on zone
                if (requiredZone === 'athlete') {
                    // If trying to access athlete zone, send to athlete login? 
                    // Or just generic login. Generic login has a selector now.
                    navigate('/login');
                } else {
                    navigate('/login');
                }
                return;
            }

            // 2. Fetch Latest Role & Setup Status
            // We fetch directly to ensure no stale state allows a breach
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role, setup_completed')
                .eq('id', session.user.id)
                .single();

            if (error || !profile) {
                console.error("AuthGuard: Profile not found.", error);
                await supabase.auth.signOut();
                navigate('/login');
                return;
            }

            const userRole = profile.role;
            const isStaff = isStaffMember(userRole);
            const isAthlete = !isStaff; // Simplification, assuming valid roles

            // 3. Zone Enforcement (The Traffic Cop)
            if (requiredZone === 'command') {
                const COMMAND_ROLES = ['owner', 'admin', 'manager'];
                const isCommandRole = COMMAND_ROLES.includes(userRole);

                if (!isCommandRole) {
                    // If they are staff but not command level, send to staff dashboard
                    if (isStaff) {
                        console.warn(`AuthGuard: Staff (${userRole}) attempted to breach Command Zone. Redirecting to Staff Dashboard...`);
                        navigate('/staff/dashboard', { replace: true });
                        return;
                    } else {
                        // If not staff at all (e.g. athlete), standard block
                        navigate('/login'); // Or home
                        return;
                    }
                }
            } else if (requiredZone === 'staff') {
                if (!isStaff) {
                    console.warn(`AuthGuard: Athlete (${userRole}) attempted to breach Staff Zone. Redirecting...`);
                    navigate('/athlete', { replace: true });
                    return;
                }
            } else if (requiredZone === 'athlete') {
                if (isStaff) {
                    console.warn(`AuthGuard: Staff (${userRole}) attempted to breach Athlete Zone. Redirecting...`);
                    navigate('/workspace/dashboard', { replace: true }); // Default to workspace/dashboard
                    return;
                }
            }

            // 4. Setup Completion Logic (Legacy ProtectedRoute Logic)
            // If setup IS complete, but we are on a setup-allowed route (and not specifically requesting setup?), 
            // usually we don't block. But if we are ON /setup and setup IS complete, kick them out.
            // Wait, the previous logic was:
            // "If Setup Complete && allowSetup (meaning we are on /setup) -> Redirect to Dashboard"
            // "If Setup Incomplete && !allowSetup -> Redirect to Modal (or do nothing now as Modal is on Dashboard)"

            // Current Requirement: "Owner Uses AcademyWizard -> Redirects to /setup"
            // So /setup must allow users with setup_completed = false.

            // If we are strictly on /setup (implied by allowSetup=true in this context usually, or we check path)
            // Let's refine: verify where we are.
            const onSetupPage = location.pathname === '/setup';

            if (isStaff && profile.setup_completed && onSetupPage) {
                // Setup is done, get out of setup page
                navigate('/workspace/dashboard', { replace: true });
                return;
            }

            // Note: If setup is NOT complete, previous logic redirected TO /setup.
            // Now we prefer the Modal on Dashboard, so we allow them to proceed to Dashboard.
            // So no blocking "Incomplete Setup" users anymore from reaching Dashboard.

            setIsAuthorized(true);

            // 5. Session & Device Security (Preserved)
            const deviceId = localStorage.getItem('wibo_device_id');
            // Optimistic start - we authorize UI first, then subscribe to kill it if needed
            // (Moved subscription outside/after setAuthorized to prevent delay on rendering?)
            // Actually, keep it here to ensuring subscription logic runs.

            const subscription = supabase
                .channel(`session_guard_${session.user.id}`)
                .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'active_sessions', filter: `user_id=eq.${session.user.id}` },
                    async (payload) => {
                        if (payload.old && payload.old.device_id === deviceId) {
                            alert("Session expired or opened on another device.");
                            await supabase.auth.signOut();
                            navigate('/login');
                        }
                    })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };

        } catch (err) {
            console.error("AuthGuard Error:", err);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate, requiredZone, location.pathname]);

    useEffect(() => {
        checkAuthorization();
    }, [checkAuthorization]);

    // UI IMPROVEMENT: Only show full screen loader if we are NOT yet authorized.
    // If we are authorized (e.g. from previous route), keep showing children while re-verifying in background.
    if (loading && !isAuthorized) {
        // Theme-aware Loader
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
                <p className="text-slate-500 font-mono text-xs tracking-widest animate-pulse">VERIFYING CLEARANCE...</p>
            </div>
        );
    }

    return isAuthorized ? children : null;
};

export default AuthGuard;
