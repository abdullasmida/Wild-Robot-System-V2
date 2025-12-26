import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { checkDeviceAccess } from '../utils/auth-guard';

const AuthGuard = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const verifyAccess = useCallback(async (retryCount = 0) => {
        try {
            // 1. Check if user is logged in
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate('/login');
                return;
            }

            // 1.5. CHECK ROLE VS ROUTE (Cross-Portal Protection) 🛡️
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            const userRole = profile?.role || 'coach';
            const currentPath = window.location.pathname;

            // Block Student -> Coach Portal
            if (currentPath.startsWith('/coach') && userRole === 'athlete') {
                console.warn("AuthGuard: Athlete attempted to breach Coach Portal. Redirecting to Athlete Home.");
                navigate('/athlete', { replace: true });
                return;
            }

            // Block Coach -> Athlete Portal
            if (currentPath.startsWith('/athlete') && userRole !== 'athlete') {
                console.warn("AuthGuard: Authorization Mismatch. Redirecting to Landing.");
                navigate('/', { replace: true });
                return;
            }

            setLoading(false);
            setIsAuthorized(true);

            // 🛑 SMART EVICTION LISTENER
            // "If my session row disappears, it means I was displaced."
            const deviceId = localStorage.getItem('wibo_device_id');

            const subscription = supabase
                .channel(`session_guard_${session.user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'DELETE',
                        schema: 'public',
                        table: 'active_sessions',
                        filter: `user_id=eq.${session.user.id}` // Filter by user to reduce traffic, check device locally
                    },
                    async (payload) => {
                        console.log("Session Deleted Event:", payload);
                        // Check if the deleted session was THIS device
                        if (payload.old && payload.old.device_id === deviceId) {
                            console.warn("⛔ SESSION DISPLACED: Signing out...");
                            await supabase.auth.signOut();
                            navigate('/login', {
                                replace: true,
                                state: { error: "Access transferred to a newer device." }
                            });
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };

        } catch (error) {
            console.error("Auth Verification Failed:", error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        verifyAccess();
    }, [verifyAccess]);

    // 🛑 SECURITY: Monitor Role Changes (Zombie Session Killer)
    useEffect(() => {
        const monitorRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase
                .channel(`profile_watch_${user.id}`)
                .on('postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                    (payload) => {
                        console.warn(`👮 Security Alert: Role changed to ${payload.new.role}`);
                        // Reload to force re-verification processing
                        window.location.reload();
                    }
                )
                .subscribe();

            return () => supabase.removeChannel(channel);
        };

        monitorRole();
    }, []);

    if (loading) {
        // High-end loading state matching the theme
        return (
            <div className="flex min-h-screen bg-slate-50">
                {/* Skeleton Sidebar */}
                <div className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 bg-slate-800 rounded-xl animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse"></div>
                            <div className="h-2 w-16 bg-slate-800 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-10 w-full bg-slate-800/50 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Skeleton Content */}
                <div className="flex-1 flex flex-col">
                    {/* Skeleton Header */}
                    <div className="h-20 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse"></div>
                            <div className="hidden xl:flex gap-3 pl-8 border-l border-slate-200 h-10 items-center">
                                <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                                <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                            <div className="h-10 w-10 bg-slate-100 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Skeleton Main Area */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="h-32 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
                            <div className="h-32 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
                            <div className="h-32 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
                        </div>
                        <div className="h-64 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return isAuthorized ? children : null;
};

export default AuthGuard;
