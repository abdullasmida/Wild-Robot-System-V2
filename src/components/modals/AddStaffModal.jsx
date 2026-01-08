import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, Shield, Briefcase } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';

export default function AddStaffModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'coach',
        sport: '' // New field for specialization
    });

    if (!isOpen) return null;

    const SPORTS = ['Gymnastics', 'Swimming', 'Football', 'Basketball', 'Tennis', 'General Fitness'];

    const handleSendInvite = async () => {
        setLoading(true);
        const toastId = toast.loading("Sending Official Invite...");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            // Get Academy ID
            const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.id).single();
            if (!profile?.academy_id) throw new Error("No Academy Found.");

            // 1. Create Invitation Record
            const token = self.crypto.randomUUID();
            const { error: inviteError } = await supabase
                .from('invitations')
                .insert({
                    academy_id: profile.academy_id,
                    email: formData.email,
                    role: formData.role,
                    token: token,
                    status: 'pending',
                    metadata: { sport: formData.sport } // Save Sport Metadata
                });

            if (inviteError) throw inviteError;

            // 2. Send Email via API
            const response = await fetch('/api/send-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    firstName: formData.firstName,
                    role: formData.role,
                    token: token,
                    // Pass sport so the email template can use it (e.g. "Gymnastics Coach")
                    specialization: formData.sport
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to send email");
            }

            toast.success(`Invite sent to ${formData.firstName}!`, { id: toastId });
            onClose();
            setFormData({ firstName: '', lastName: '', email: '', role: 'coach', sport: '' });

        } catch (err) {
            console.error(err);
            toast.error(err.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-emerald-500" />
                        Add New Staff
                    </h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                            <input
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                type="text"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-900"
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                            <input
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                type="text"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-900"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                type="email"
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-900"
                                placeholder="john.doe@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-900 appearance-none"
                                >
                                    <option value="coach">Coach</option>
                                    <option value="head_coach">Head Coach</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Sport Selection (Only for Coaches) */}
                        {(formData.role === 'coach' || formData.role === 'head_coach') && (
                            <div className="space-y-1 animate-in slide-in-from-left-2 duration-300">
                                <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Department / Sport</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500" />
                                    <select
                                        value={formData.sport}
                                        onChange={e => setFormData({ ...formData, sport: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-emerald-800 appearance-none"
                                    >
                                        <option value="">-- Select --</option>
                                        {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleSendInvite}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Official Invite'}
                    </button>
                </div>
            </div>
        </div>
    );
}
