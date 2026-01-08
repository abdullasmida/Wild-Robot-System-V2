import React, { useState } from 'react';
import {
    UserPlus, Megaphone, Clock, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActionCard from '../../components/dashboard/ActionCard';
import BottomSheet from '../../components/ui/BottomSheet';
import StaffInviteForm from '../../components/forms/StaffInviteForm';
import SetupWizardModal from '../../components/onboarding/SetupWizardModal';
import { useAuthStore } from '@/stores/useAuthStore';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const { user, checkSession, loading } = useAuthStore();

    // Sheet State
    const [isStaffSheetOpen, setIsStaffSheetOpen] = useState(false);

    // Derived State
    // Only show wizard if user is loaded, NOT setup, and NO academy is set up
    const showSetupWizard = user && !user.setup_completed && !user.academy?.setup_completed;

    const handleStaffSuccess = () => {
        setIsStaffSheetOpen(false);
        // Ideally show a toast or notification here
    };

    if (loading) return null; // Prevent modal flash during session check

    // --- STANDARD OPERATIONS VIEW (Existing) ---
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up relative">

            {/* ONBOARDING MODAL (Overlay) */}
            <SetupWizardModal
                isOpen={!!showSetupWizard}
                onComplete={() => {
                    // Refresh session to update 'setup_completed' in UI
                    checkSession();
                }}
            />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Operations Center</h1>
                <p className="text-slate-500">Welcome back. Here is what's happening in your kingdom.</p>
            </div>

            {/* 1. OPERATIONS GRID (Quick Actions) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard title="Add New Staff" desc="Invite coaches or managers." icon={UserPlus} color="bg-emerald-600" onClick={() => setIsStaffSheetOpen(true)} />
                <ActionCard title="Send Announcement" desc="Notify all staff & athletes." icon={Megaphone} color="bg-blue-600" onClick={() => { }} />
                <ActionCard title="Review Payroll" desc="Check salaries & treasury." icon={Clock} color="bg-purple-600" onClick={() => navigate('/owner/finance')} />
            </div>

            {/* 2. THE FEED (Activity Log) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Live Activity Feed
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold animate-pulse">LIVE</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-5 hover:bg-slate-50 transition flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-600">
                                {i === 1 ? 'AH' : i === 2 ? 'MK' : 'WR'}
                            </div>
                            <div>
                                <p className="text-sm text-slate-800">
                                    <span className="font-bold">Coach Ahmed</span> marked attendance for <span className="font-bold">Level 2 Gymnastics</span>.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">2 minutes ago • Via Mobile App</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 text-center border-t border-slate-100">
                    <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All Activity</button>
                </div>
            </div>

            {/* Sheets */}
            <BottomSheet
                isOpen={isStaffSheetOpen}
                onClose={() => setIsStaffSheetOpen(false)}
                title="Invite New Staff"
            >
                <StaffInviteForm
                    onSuccess={handleStaffSuccess}
                    onCancel={() => setIsStaffSheetOpen(false)}
                />
            </BottomSheet>
        </div>
    );
};

export default OwnerDashboard;