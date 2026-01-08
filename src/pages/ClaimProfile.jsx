import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, User, ArrowRight, Loader2, Zap } from 'lucide-react';

const ClaimProfile = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', password: '' });
    const [error, setError] = useState(null);

    // 1. Validate Token
    useEffect(() => {
        const checkToken = async () => {
            if (!token) {
                setError("Invalid claim link.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('invitations')
                .select('*, academies(name)')
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (error || !data) {
                setError("This claim link has expired or is invalid.");
            } else if (data.role !== 'athlete') {
                setError("This link is not for an Athlete profile.");
            } else {
                setInvitation(data);
                // Pre-fill name if known from invite metadata?
                // setFormData(prev => ({ ...prev, fullName: data.metadata?.name || '' }));
            }
            setLoading(false);
        };

        checkToken();
    }, [token]);

    // 2. Complete Claim
    const handleClaim = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // A. Create Auth Account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitation.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'athlete',
                    },
                },
            });

            if (authError) throw authError;

            const userId = authData.user?.id;

            if (userId) {
                // B. Create/Update Profile
                // Since Auth creates the user, we ensure the profile reflects the athlete role
                // We also link validation to the invite.

                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        academy_id: invitation.academy_id,
                        role: 'athlete',
                        full_name: formData.fullName,
                        setup_completed: true
                    })
                    .eq('id', userId);

                if (profileError) throw profileError;

                // C. Link specific Athlete Record (The "Claim")
                // We look for an athlete record in this academy with the same email
                const { error: linkError } = await supabase
                    .from('athletes')
                    .update({ profile_id: userId })
                    .eq('email', invitation.email)
                    .eq('academy_id', invitation.academy_id);

                if (linkError) {
                    console.error("Failed to link athlete record:", linkError);
                    // Continue anyway, support can fix linkage later
                }

                // D. Burn Invitation
                await supabase
                    .from('invitations')
                    .update({ status: 'accepted' })
                    .eq('id', invitation.id);

                // E. Redirect to Athlete Portal
                navigate('/athlete');
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="bg-slate-900 border border-red-500/20 p-8 rounded-2xl shadow-xl text-center max-w-md">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">⚠️</div>
                <h2 className="text-xl font-bold text-white mb-2">Claim Error</h2>
                <p className="text-slate-400">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans selection:bg-blue-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Athlete Access</h1>
                    <p className="text-blue-100/80 font-medium">
                        Claim your profile at <br />
                        <span className="text-white font-bold">{invitation?.academies?.name}</span>
                    </p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <div className="mb-6 bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Identifying As</span>
                        <div className="text-lg font-bold text-white mt-0.5 truncate">
                            {invitation?.email}
                        </div>
                    </div>

                    <form onSubmit={handleClaim} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Your Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                                    placeholder="e.g. Alex Chen"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Set Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                            Activate Athlete Portal <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClaimProfile;
