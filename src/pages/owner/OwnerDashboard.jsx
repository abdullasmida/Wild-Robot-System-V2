import React, { useState } from 'react';
import {
    UserPlus, Megaphone, Clock, Activity,
    Rocket, Calendar, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActionCard from '../../components/dashboard/ActionCard';
import ChecklistWidget from '../../components/dashboard/ChecklistWidget';
import BottomSheet from '../../components/ui/BottomSheet';
import StaffInviteForm from '../../components/forms/StaffInviteForm';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    // Sheet State
    const [isStaffSheetOpen, setIsStaffSheetOpen] = useState(false);

    // MOCK STATE: Toggle this to 1 to see the "Operations Center"
    const athleteCount = 0;
    const isNewAccount = athleteCount === 0;

    const handleStaffSuccess = () => {
        setIsStaffSheetOpen(false);
        // Ideally show a toast or notification here
    };

    if (isNewAccount) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header */}
                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                Getting Started
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Welcome, Commander.</h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Your kingdom is ready. Complete these essential missions to activate your operations center.
                        </p>

                        {/* Progress */}
                        <div className="mt-8 max-w-sm">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-emerald-400">Setup Progress</span>
                                <span>25%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-1/4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checklist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ChecklistWidget
                        title="Create Account"
                        desc="Your secure owner profile is active."
                        icon={Rocket}
                        isCompleted={true}
                    />
                    <ChecklistWidget
                        title="Add First Staff"
                        desc="Invite a coach or manager to help."
                        icon={UserPlus}
                        isCompleted={false}
                        onClick={() => setIsStaffSheetOpen(true)}
                    />
                    <ChecklistWidget
                        title="Add First Athlete"
                        desc="Register your first member."
                        icon={Users}
                        isCompleted={false}
                        onClick={() => navigate('/owner/athletes')}
                    />
                    <ChecklistWidget
                        title="Setup Schedule"
                        desc="Create a class or training session."
                        icon={Calendar}
                        isCompleted={false}
                        onClick={() => navigate('/owner/schedule')}
                    />
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
    }

    // --- STANDARD OPERATIONS VIEW (Existing) ---
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

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