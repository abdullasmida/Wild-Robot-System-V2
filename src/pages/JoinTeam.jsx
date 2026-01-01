import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const JoinTeam = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', password: '' });
    const [error, setError] = useState(null);

    // 1. التحقق من صحة التوكن عند فتح الصفحة
    useEffect(() => {
        const checkToken = async () => {
            if (!token) {
                setError("Invalid invitation link.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('invitations')
                .select('*, academies(name)') // نجيب اسم الأكاديمية بالمرة
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (error || !data) {
                setError("This invitation has expired or is invalid.");
            } else {
                setInvitation(data);
            }
            setLoading(false);
        };

        checkToken();
    }, [token]);

    // 2. إتمام التسجيل
    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // A. إنشاء حساب Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitation.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: invitation.role, // نأخذ الدور من الدعوة
                    },
                },
            });

            if (authError) throw authError;

            const userId = authData.user?.id;

            if (userId) {
                // B. إنشاء البروفايل وربطه بالأكاديمية
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        academy_id: invitation.academy_id, // الربط السحري
                        role: invitation.role,
                        full_name: formData.fullName,
                        setup_completed: true
                    })
                    .eq('id', userId);

                if (profileError) throw profileError;

                // C. حرق الدعوة (عشان متستخدمش تاني)
                await supabase
                    .from('invitations')
                    .update({ status: 'accepted' })
                    .eq('id', invitation.id);

                // Redirect Coach to Dashboard
                navigate('/coach/home');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-2xl">⚠️</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Invitation Error</h2>
                <p className="text-slate-500">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-emerald-600 p-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome to the Team!</h1>
                    <p className="text-emerald-100">
                        You have been invited to join <br />
                        <span className="font-black text-white text-lg">{invitation?.academies?.name}</span>
                    </p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <div className="mb-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Role Assigned</span>
                        <div className="text-lg font-bold text-slate-800 capitalize">{invitation?.role.replace('_', ' ')}</div>
                        <div className="text-sm text-slate-500 mt-1">{invitation?.email}</div>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1">Set Your Name</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    placeholder="Captain Name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1">Create Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4">
                            Accept & Login <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinTeam;