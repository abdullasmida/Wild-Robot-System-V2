import React, { useState } from 'react';
import { UserPlus, Search, Filter, Phone, MessageSquare, Wallet, MoreVertical, Circle } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import UniversalAddModal from '../../components/modals/UniversalAddModal';

// Mock Data for Directory
const MOCK_STAFF = [
    {
        id: 1,
        name: 'Sarah Connor',
        role: 'Head Coach',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        status: 'online',
        location: 'Main Academy',
        type: 'Full Time'
    },
    {
        id: 2,
        name: 'Mike Ross',
        role: 'Senior Coach',
        avatar: 'https://i.pravatar.cc/150?u=mike',
        status: 'busy',
        location: 'Branch B',
        type: 'Full Time'
    },
    {
        id: 3,
        name: 'Alex Murphy',
        role: 'Freelance Trainer',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        status: 'offline',
        location: 'Main Academy',
        type: 'Part Time'
    },
    {
        id: 4,
        name: 'Jessica Pearson',
        role: 'Admin Manager',
        avatar: 'https://i.pravatar.cc/150?u=jess',
        status: 'online',
        location: 'Main Academy',
        type: 'Full Time'
    }
];

const StatusBadge = ({ status }) => {
    const colors = {
        online: 'bg-emerald-500',
        busy: 'bg-amber-500',
        offline: 'bg-slate-300'
    };
    return (
        <span className={`w-3 h-3 rounded-full border-2 border-white absolute bottom-0 right-0 ${colors[status] || colors.offline}`} />
    );
};

const StaffRoster = () => {
    const [staff, setStaff] = useState(MOCK_STAFF); // Use Mock Data
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSuccess = () => {
        setAddModalOpen(false);
        // In real app, we'd refetch staff list here
    };

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
                    <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
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
                    icon={Users}
                    title="No Staff Found"
                    description="You haven't added any team members yet. Build your dream team now."
                    actionLabel="Invite First Member"
                    onAction={() => setAddModalOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {staff.map((member) => (
                        <div key={member.id} className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden">

                            {/* Decorative Background Blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100" />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="relative">
                                    <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300" />
                                    <StatusBadge status={member.status} />
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6 relative z-10">
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">{member.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200">
                                        {member.role}
                                    </span>
                                    {member.type === 'Full Time' && (
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100">
                                            Contract
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
                initialTab={0}
            />
        </div>
    );
};

export default StaffRoster;
