import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../supabaseClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { Trophy, CheckCircle, Loader2, PlayCircle, Star, ArrowRight } from 'lucide-react';

export default function AcademyWizard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        source: '' // "Where did you hear about us?"
    });

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        referral_source: formData.source
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                // If auto-logged in, verify profile exists or create it?
                // The previous wizard had a second step for Academy Name. 
                // For this "Let's Go" flow, we might want to redirect to an onboarding 
                // page inside the dashboard or assume defaults.
                // For now, let's create the basic profile and redirect to home (or a setup page).

                // Note: Triggers usually handle profile creation on signup, 
                // but if we need manual profile creation:
                // 3. Create/Update Profile with Identity Data
                // We generate a random avatar color for the user if not set by DB default
                const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        role: 'owner', // Default role for new Academy Creators
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        avatar_color: randomColor, // Bind the new color column
                        onboarding_step: 1
                    })
                    .eq('id', data.user.id);

                if (profileError) {
                    console.error("Profile Update Error:", profileError);
                    // Non-blocking error, user can still proceed
                }

                // If update fails (e.g. row doesn't exist yet due to race condition), 
                // we might need an insert or rely on DB triggers. 
                // Assuming DB trigger creates the row, update is fine.

                // Force a session refresh so useAuthStore gets the new profile
                // This prevents ProtectedRoute from seeing "null" and kicking us to /login
                await useAuthStore.getState().checkSession();

                // Show Success Toast
                toast.success("Welcome, Commander!");

                navigate('/setup');
            } else {
                alert("Account created! Please check your email to confirm.");
            }

        } catch (err) {
            console.error("Sign Up Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-white selection:bg-emerald-100">

            {/* --- LEFT SIDE (VISUAL) 50% --- */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-center">
                {/* Background Image / Gradient */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517466787929-bc90951d6dbb?blur=80&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-slate-900/90"></div>

                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest mb-8">
                        <Star className="w-3 h-3 fill-emerald-300" />
                        Trust the Process
                    </div>

                    <h1 className="text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                        "A small step for you, a giant leap for your academy."
                    </h1>

                    <div className="flex flex-col gap-4 text-slate-300 text-lg font-medium">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span>Automated Billing & Payments</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span>Professional Player Evaluations</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span>Parent Communication Hub</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* --- RIGHT SIDE (FORM) 50% --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-white relative">

                {/* Mobile Header (Only visible on small screens) */}
                <div className="lg:hidden w-full mb-8 flex items-center gap-2">
                    <div className="bg-emerald-600 rounded-lg p-1.5">
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl text-slate-900">Wild Robot</span>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Get started for free.</h2>
                        <p className="text-slate-500">No credit card required. 14-day free trial.</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-5">

                        {/* Row: First & Last Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                                placeholder="owner@academy.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Create Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                                placeholder="Min. 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                                placeholder="Confirm your password"
                                minLength={8}
                                required
                            />
                        </div>

                        {/* Dropdown: Source */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Where did you hear about us?</label>
                            <div className="relative">
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none font-medium text-slate-700"
                                    required
                                >
                                    <option value="" disabled>Select an option</option>
                                    <option value="Google">Google Search</option>
                                    <option value="Social Media">Social Media (Instagram/Facebook)</option>
                                    <option value="Referral">Friend / Colleague</option>
                                    <option value="Advertisement">Advertisement</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-xl shadow-emerald-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "LET'S GO"}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>

                        <p className="text-xs text-slate-400 text-center leading-relaxed">
                            By clicking "Let's Go", you agree to our <a href="#" className="underline hover:text-emerald-600">Terms of Service</a> and <a href="#" className="underline hover:text-emerald-600">Privacy Policy</a>.
                        </p>
                    </form>

                    <div className="text-center pt-8 border-t border-slate-100">
                        <p className="text-slate-500 font-medium">
                            Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Right Logo (Desktop) */}
            <div className="hidden lg:flex absolute top-8 right-8 items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => navigate('/')}>
                <div className="bg-emerald-600 rounded-lg p-1.5">
                    <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900">Wild Robot</span>
            </div>

        </div>
    );
}
