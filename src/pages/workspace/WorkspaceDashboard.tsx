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

    if (!user) return null;

    const role = (user.role || '').toLowerCase();

    console.log('[WorkspaceDashboard] Rendering for:', { user: user.email, role });

    // Fallback for missing role
    if (!role) {
        return <div className="p-8 text-center text-red-500">Error: No role assigned to user.</div>;
    }

    // --- Role Based Rendering ---

    // --- Role Based Rendering ---

    // 1. Finance Dashboard (Accountant / Owner)
    // Note: 'VIEW_FINANCE_DASHBOARD' check
    // if (canViewFinance) return <FinanceDashboard />; // Future

    // 2. Coach Dashboard
    if (canViewCoachContext) {
        return <CoachDashboard />;
    }

    // 3. Owner / Default Dashboard
    return <OwnerDashboard />;
};

export default WorkspaceDashboard;
