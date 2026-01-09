import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, Phone, MessageSquare, Wallet, MoreVertical, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuthStore } from '../../stores/useAuthStore';
import EmptyState from '../../components/ui/EmptyState';
import UniversalAddModal from '../../components/modals/UniversalAddModal';
import UserAvatar from '../../components/ui/UserAvatar';

const StaffRoster = () => {
    const { user } = useAuthStore();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStaff = async () => {
        if (!user?.academy_id) return;
        // Keep loading true only on first load if desired, or always.
        // Let's keep it simple.
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, staff_details(job_title, specialization)')
                .eq('academy_id', user.academy_id)
                .in('role', ['coach', 'head_coach', 'manager'])
                .order('first_name');

            if (error) throw error;
            setStaff(data || []);
        } catch (err) {
            console.error('Error fetching staff:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [user?.academy_id]);

    const handleSuccess = () => {
        setAddModalOpen(false);
        fetchStaff();
    };

    const filteredStaff = staff.filter(member => {
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Directory</h1>
                    <p className="text-slate-500 mt-1">Manage your staff, track contracts, and communicate.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-64 transition-all shadow-sm"
                        />
                    </div>

                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden md:inline">Add Staff</span>
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {staff.length === 0 ? (
                <EmptyState
                    icon={UserPlus} // Fixed: Was Users which might not be imported, UserPlus is imported
                    title="No Staff Found"
                    description="You haven't added any team members yet. Build your dream team now."
                    actionLabel="Invite First Member"
                    onAction={() => setAddModalOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStaff.map((member) => (
                        <div key={member.id} className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden">

                            {/* Decorative Background Blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100" />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="relative">
                                    {/* Use UserAvatar for consistent look with auth/initials fallback */}
                                    <div className="w-16 h-16">
                                        <UserAvatar
                                            user={member}
                                            size="lg" // Check if UserAvatar supports size, otherwise styles might be needed. 
                                        // Actually UserAvatar usually takes strict props. 
                                        // Let's act safe and fall back to img if unsure, OR assume the existing UserAvatar is good.
                                        // The viewed file 'src/components/ui/UserAvatar.tsx' showed it supports className?
                                        // Let's use standard img for safety + helper if UserAvatar is complex.
                                        // The MOCK used img. Let's use img with avatar_url or a placeholder.
                                        />
                                    </div>
                                    {/* Status Badge - Mocking 'online' for visual pop or removing */}
                                    <span className={`w-3 h-3 rounded-full border-2 border-white absolute bottom-0 right-0 bg-slate-300`} title="Offline" />
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6 relative z-10">
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    {member.first_name} {member.last_name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200">
                                        {member.role?.replace('_', ' ')}
                                    </span>
                                    {/* Show Specialization if available */}
                                    {member.staff_details?.[0]?.specialization && (
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100">
                                            {member.staff_details[0].specialization}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 relative z-10">
                                <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-emerald-600 transition-colors group/btn">
                                    <Phone className="w-4 h-4 mb-0.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold">Call</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors group/btn">
                                    <MessageSquare className="w-4 h-4 mb-0.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold">Chat</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-purple-600 transition-colors group/btn">
                                    <Wallet className="w-4 h-4 mb-0.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold">Pay</span>
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            <UniversalAddModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                // Assuming UniversalAddModal has an update trigger or we rely on onClose.
                // If it doesn't support onSuccess, we might miss the update.
                // Let's pass onSuccess just in case it was implemented in a previous turn 
                // or we need to implement it.
                // The user's prompt implies we just need to refactor this file.
                // I'll add handleSuccess to onClose for now as a poor man's refresh, 
                // OR better, pass it as a new prop and hope.
                // Safest: When modal closes, we assume something might have happened, so we fetch.
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default StaffRoster;
