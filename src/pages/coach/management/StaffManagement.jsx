import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus, MoreHorizontal, CheckCircle, AlertCircle, Search, Filter, Briefcase } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import Modal from '../../../components/ui/Modal';

export default function StaffManagement() {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedRole, setSelectedRole] = useState('coach');
    const [actionLoading, setActionLoading] = useState(false);

    const STAFF_ROLES = [
        { id: 'admin', label: 'Admin / Owner', color: 'bg-slate-900 text-white' },
        { id: 'manager', label: 'Manager', color: 'bg-indigo-600 text-white' },
        { id: 'head_coach', label: 'Head Coach', color: 'bg-orange-600 text-white' },
        { id: 'coach', label: 'Coach', color: 'bg-blue-600 text-white' },
        { id: 'hr', label: 'HR', color: 'bg-pink-600 text-white' },
        { id: 'sales', label: 'Sales', color: 'bg-emerald-600 text-white' },
    ];

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user);

            // Get Current User Profile to know Academy Name
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(userProfile);

            if (userProfile?.academy_name) {
                // Fetch All Non-Athletes for this Academy
                const { data: staffData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('academy_name', userProfile.academy_name)
                    .neq('role', 'athlete')
                    .order('role', { ascending: true });

                if (error) throw error;
                setStaff(staffData || []);
            }
        } catch (err) {
            console.error("Error fetching staff:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteClick = (member) => {
        setSelectedMember(member);
        setSelectedRole(member.role);
        setIsPromoteModalOpen(true);
    };

    const handleSaveRole = async () => {
        if (!selectedMember || !selectedRole) return;
        setActionLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: selectedRole })
                .eq('id', selectedMember.id);

            if (error) throw error;

            // Optimistic Update
            setStaff(prev => prev.map(m => m.id === selectedMember.id ? { ...m, role: selectedRole } : m));
            setIsPromoteModalOpen(false);

        } catch (err) {
            alert("Failed to update role: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Filter Logic
    const filteredStaff = staff.filter(m =>
        (m.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (roleId) => {
        const role = STAFF_ROLES.find(r => r.id === roleId) || { label: roleId, color: 'bg-slate-400 text-white' };
        return (
            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${role.color}`}>
                {role.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Shield className="text-indigo-600" size={28} />
                        Team Directory
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        managing {staff.length} team members for <span className="text-indigo-600 font-bold">{profile?.academy_name}</span>
                    </p>
                </div>
                <button
                    onClick={() => alert("Invite Logic would go here (Send Email via Edge Function)")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    Invite Staff
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search team by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Staff Found</h3>
                    <p className="text-slate-500">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Profile</th>
                                <th className="px-6 py-4">Role context</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStaff.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                                {member.full_name?.charAt(0) || member.email?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{member.full_name || 'Staff Member'}</p>
                                                <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(member.role)}
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500 font-medium">
                                        {new Date(member.created_at || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handlePromoteClick(member)}
                                            className="text-slate-400 hover:text-indigo-600 font-bold text-xs border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            Manage Role
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State Logic for One-Man Army */}
            {!loading && staff.length === 1 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-indigo-900 font-bold mb-1 flex items-center gap-2">
                            <AlertCircle size={18} />
                            One-Man Army?
                        </h4>
                        <p className="text-sm text-indigo-700">You are currently the only staff member. Add coaches to split the workload.</p>
                    </div>
                </div>
            )}

            {/* Promotion Modal */}
            <Modal
                isOpen={isPromoteModalOpen}
                onClose={() => setIsPromoteModalOpen(false)}
                title="Manage Staff Role"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                            {selectedMember?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{selectedMember?.full_name || selectedMember?.email}</h3>
                            <p className="text-xs text-slate-500">Current: {getRoleBadge(selectedMember?.role)}</p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select New Role</label>
                        {STAFF_ROLES.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${selectedRole === role.id
                                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${role.color.replace('text-white', 'bg-opacity-20 text-current')}`}>
                                        <Briefcase size={16} />
                                    </div>
                                    <span className={`text-sm font-bold ${selectedRole === role.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {role.label}
                                    </span>
                                </div>
                                {selectedRole === role.id && <CheckCircle size={18} className="text-indigo-600" />}
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setIsPromoteModalOpen(false)}
                            className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveRole}
                            disabled={actionLoading}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            {actionLoading ? 'Updating...' : 'Save Role'}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}
