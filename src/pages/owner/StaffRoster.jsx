import React, { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import BottomSheet from '../../components/ui/BottomSheet';
import StaffInviteForm from '../../components/forms/StaffInviteForm';

const StaffRoster = () => {
    const [staff, setStaff] = useState([]); // Mock: Empty initially
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleSuccess = () => {
        setIsSheetOpen(false);
        // In real app, we'd refetch staff list here
        setStaff([{ id: 1, name: 'New Guy' }]); // Optimistic update simulation
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Staff Roster</h1>
                    <p className="text-slate-500">Manage your team and assignments.</p>
                </div>
                {staff.length > 0 && (
                    <button
                        onClick={() => setIsSheetOpen(true)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition"
                    >
                        <UserPlus className="w-4 h-4" /> Add Staff
                    </button>
                )}
            </div>

            {staff.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No Staff Found"
                    description="You haven't added any team members yet. Build your dream team now."
                    actionLabel="Invite First Member"
                    onAction={() => setIsSheetOpen(true)}
                />
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-center text-slate-400 py-12">Staff list mock...</p>
                </div>
            )}

            <BottomSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title="Invite New Staff"
            >
                <StaffInviteForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsSheetOpen(false)}
                />
            </BottomSheet>
        </div>
    );
};

export default StaffRoster;
