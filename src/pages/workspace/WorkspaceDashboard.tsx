import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePermission } from '@/config/permissions';
import { Link } from 'react-router-dom';
import { Loader2, CalendarDays, Users } from 'lucide-react';
import OwnerDashboard from '../owner/OwnerDashboard'; // Used in Owner view
import FinancialOverviewWidget from '@/components/dashboard/widgets/FinancialOverviewWidget';
import AcademyHealthWidget from '@/components/dashboard/widgets/AcademyHealthWidget';
import CoachScheduleWidget from '@/components/dashboard/widgets/CoachScheduleWidget';
import MyAthletesWidget from '@/components/dashboard/widgets/MyAthletesWidget';

const WorkspaceDashboard = () => {
    const { user, loading } = useAuthStore();
    const canViewFinance = usePermission('VIEW_FINANCE_DASHBOARD');

    // --- Hooks must be called unconditionally ---
    // (We use role check directly for layout as requested)

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!user) return null;

    const role = (user.role || '').toLowerCase();
    const isOwner = role === 'owner';

    // --- OWNER VIEW ---
    if (isOwner) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                {/* HEADQUARTERS HEADER */}
                <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center pattern-grid-lg relative overflow-hidden">
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                                    Command Center 🏰
                                </h1>
                                <p className="text-emerald-100 font-bold mt-1">
                                    Welcome back, Commander {user.first_name || 'Owner'}.
                                </p>
                            </div>
                            <div className="text-4xl opacity-50">👑</div>
                        </div>
                    </div>
                </div>

                {/* OWNER WIDGETS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <FinancialOverviewWidget />
                        </div>
                    </div>
                    <div className="h-full">
                        <AcademyHealthWidget />
                    </div>
                </div>

                {/* OPERATIONS CENTER (Existing Dashboard) */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Operations</h3>
                    <OwnerDashboard />
                </div>
            </div>
        );
    }

    // --- COACH / STAFF VIEW ---
    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* FIELD OPS HEADER */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center pattern-grid-lg relative overflow-hidden">
                <div className="relative z-10 w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                                Field Operations 👟
                            </h1>
                            <p className="text-slate-400 font-bold mt-1">
                                Ready to train, Coach {user.first_name || 'Coach'}?
                            </p>
                        </div>
                        <div className="text-4xl opacity-50">🧢</div>
                    </div>
                </div>
            </div>

            {/* COACH WIDGETS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-full min-h-[400px]">
                    <CoachScheduleWidget />
                </div>
                <div className="h-full min-h-[400px]">
                    <MyAthletesWidget />
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/workspace/schedule" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition text-center group">
                    <CalendarDays className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-emerald-500 transition" />
                    <span className="font-bold text-slate-700 text-sm">Full Schedule</span>
                </Link>
                <Link to="/workspace/athletes" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition text-center group">
                    <Users className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-blue-500 transition" />
                    <span className="font-bold text-slate-700 text-sm">Full Roster</span>
                </Link>
            </div>
        </div>
    );
};

export default WorkspaceDashboard;
