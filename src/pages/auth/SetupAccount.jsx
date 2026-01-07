import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';

const SetupAccount = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });

    const { user: profile, checkSession } = useAuthStore();

    useEffect(() => {
        const init = async () => {
            // Ensure session is fresh
            await checkSession();

            if (profile?.setup_completed) {
                toast.info("Account already setup. Redirecting...");
                navigate(profile.role === 'owner' ? '/owner/dashboard' : '/coach/home');
            } else {
                setLoading(false);
            }
        };
        init();
    }, [profile, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading("Securing your account...");

        try {
            // 1. Update Authentication Password
            const { error: authError } = await supabase.auth.updateUser({
                password: formData.password
            });
            if (authError) throw authError;

            const { data: { user } } = await supabase.auth.getUser();

            // 2. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    setup_completed: true
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            toast.success("Welcome aboard, Commander!", { id: toastId });

            // 3. Redirect based on role
            // We fetch role again to be safe
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            const target = profile?.role === 'owner' ? '/owner/dashboard' : '/coach'; // Simplified coach route for now

            // Artificial delay for UX
            setTimeout(() => {
                navigate(target);
            }, 1000);

        } catch (err) {
            console.error("Setup Error:", err);
            toast.error(err.message, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-emerald-500 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white backdrop-blur-sm">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Welcome to Wild Robot</h1>
                    <p className="text-emerald-100 font-medium">Let's secure your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">First Name</label>
                            <input
                                required
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-800"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Last Name</label>
                            <input
                                required
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-800"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Create New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-300" />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-800"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-300" />
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-800"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Setting up...' : 'Complete Setup'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupAccount;
