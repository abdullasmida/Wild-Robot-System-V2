import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

const SetupPasswordPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // We expect the user to be "logged in" via the magic link (or auto-confirmed in local mode)
    // Actually, for local dev fallback, the user is created with a temp password.
    // In production (Email Invite), clicking the link logs them in (Exchange Code).

    // However, since we are handling the 'Local Fallback' case primarily right now:
    // The user technically has a temp password we generated. 
    // To make this realistic: The user should probably use the Recovery Flow or Update User flow.

    // BUT, simpler approach for this 'Invite' flow:
    // The user clicks the link. If they are already authenticated (which they might be if they just clicked a magic link), great.
    // If not, this page usually handles "Recovery" (Forgot Password) type tokens.

    // ADJUSTMENT: Since we are using "SignUp" with a temp password in the fallback, 
    // the user doesn't know the password to log in!
    // So the fallback flow has a gap: The user exists but can't login.

    // FIXING THE GAP:
    // In the Fallback (Local Mode), we should probably set the password to something known OR better yet,
    // Just realize that testing "Invite" locally requires checking the "Supabase Dashboard > Auth" to see the user.

    // PROPOSAL for Setup Page:
    // This page is for users who HAVE a session (via magic link) and want to set their PERMANENT password.

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // In a real magic link flow, the URL fragment handles the session setup automatically by Supabase client
                // If no session, maybe they are taking too long or link expired.
                // For now, let's just show a warning or redirect to login
                console.log("No active session found on Setup Password page.");
            }
        };
        checkSession();
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password too short', { description: 'Must be at least 6 characters' });
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success('Password Set Successfully! 🎉', {
                description: 'You can now log in with your new password.'
            });

            // Redirect to Onboarding or Dashboard
            // For Coach: /onboarding
            setTimeout(() => {
                navigate('/onboarding');
            }, 1000);

        } catch (error: any) {
            console.error(error);
            toast.error('Error setting password', { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Setup Your Password</h2>
                        <p className="text-slate-500 mt-2">Create a secure password to access your account.</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Setting Password...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Complete Setup
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SetupPasswordPage;
