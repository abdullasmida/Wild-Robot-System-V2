import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AddAthleteModal({ isOpen, onClose, academyName, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 0. Get Coach User & Academy ID
            const { data: { user: coachUser } } = await supabase.auth.getUser();

            let academyId = coachUser?.user_metadata?.academy_id;

            // Fallback: If not in metadata, fetch from profile
            if (!academyId) {
                const { data: coachProfile } = await supabase
                    .from('profiles')
                    .select('academy_id')
                    .eq('id', coachUser.id)
                    .single();
                academyId = coachProfile?.academy_id;
            }

            // 1. Create Auth User
            const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}!`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: tempPassword,
                options: {
                    data: {
                        first_name: formData.fullName.split(' ')[0],
                        last_name: formData.fullName.split(' ').slice(1).join(' '),
                        role: 'athlete',
                        // Link athlete to academy via metadata for triggers/RLS
                        academy_id: academyId,
                        academy_name: academyName
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Failed to create user account.");

            // 2. Insert into Profiles (V3 Schema)
            // Note: If a trigger exists, this might be redundant or fail. 
            // We use 'upsert' to be safe, or just update if the trigger made it.
            // Let's try UPDATE first (assuming trigger), if not, assume INSERT.

            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', authData.user.id)
                .single();

            const profilePayload = {
                id: authData.user.id,
                role: 'athlete',
                academy_id: academyId, // CRITICAL FIX: Ensure DB link
                academy_name: academyName,
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                date_of_birth: formData.dob,
                onboarding_step: 1
            };

            let profileError;

            if (existingProfile) {
                const { error } = await supabase
                    .from('profiles')
                    .update(profilePayload)
                    .eq('id', authData.user.id);
                profileError = error;
            } else {
                const { error } = await supabase
                    .from('profiles')
                    .insert([profilePayload]);
                profileError = error;
            }

            if (profileError) throw profileError;

            // Success
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
                setSuccess(false);
                setFormData({ fullName: '', email: '', phone: '', dob: '' });
            }, 1500);

        } catch (err) {
            console.error("Add Athlete Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <UserPlus size={20} className="text-emerald-600" />
                            Add New Athlete
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">To {academyName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Athlete Added!</h3>
                            <p className="text-slate-500">The account has been created successfully.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                                    placeholder="e.g. Michael Jordan"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                                    placeholder="athlete@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400">Used for login. A temp password will be generated.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                                        placeholder="+971..."
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                                        value={formData.dob}
                                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Create Athlete Profile'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
