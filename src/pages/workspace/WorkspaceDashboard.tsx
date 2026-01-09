import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePermission } from '@/config/permissions';
import OwnerDashboard from '../owner/OwnerDashboard';
import CoachDashboard from '../coach/CoachDashboard';
import { Loader2 } from 'lucide-react';

const WorkspaceDashboard = () => {
    const { user, loading } = useAuthStore();

    // --- Hooks must be called unconditionally ---
    const canViewFinance = usePermission('VIEW_FINANCE_DASHBOARD');
    const canViewCoachContext = usePermission('VIEW_COACH_DASHBOARD');

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // SAFETY CHECK: If user is authed but query for profile failed/is null
    if (!user) return null; // Should be handled by AuthGuard but safe to keep

    // Explicit Profile Check (sometimes user object exists but profile fetch is lagging/failed)
    // We can check if we have the role to determine if profile is 'ready'
    if (!user.role && !role) {
        // Attempted to use 'role' variable from below too early? 
        // Let's just check the store user object which should have metadata. 
        // Ideally relying on the 'role' derived below.
    }


    const role = (user.role || '').toLowerCase();

    console.log('[WorkspaceDashboard] Rendering for:', { user: user.email, role });

    // Fallback for missing role
    if (!role) {
        return <div className="p-8 text-center text-red-500">Error: No role assigned to user.</div>;
    }

    // --- Role Based Rendering ---

    // --- Role Based Rendering ---

    // 1. Finance Dashboard
    if (canViewFinance) return <div className="p-8">Finance Dashboard (Coming Soon)</div>;

    // 2. Coach Dashboard
    if (canViewCoachContext) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center pattern-grid-lg">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Field Operations</h1>
                        <p className="text-slate-400 font-medium">Ready to train the next generation, Coach {user.first_name || 'Coach'}?</p>
                    </div>
                    <div className="text-3xl">🧢</div>
                </div>
                <CoachDashboard />
            </div>
        );
    }

    // 3. Owner / Default Dashboard
    return (
        <div className="space-y-6">
            <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center pattern-grid-lg">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Command Center</h1>
                    <p className="text-emerald-100 font-bold">Welcome back, Commander {user.first_name || 'Owner'}.</p>
                </div>
                <div className="text-3xl">👑</div>
            </div>
            <OwnerDashboard />
        </div>
    );
};

export default WorkspaceDashboard;
