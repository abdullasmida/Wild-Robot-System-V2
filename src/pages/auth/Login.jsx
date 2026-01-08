import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { isStaffMember } from '../../components/AuthGuard';

// Using consistent branding colors
const THEME = {
    COACH: {
        primary: 'emerald',
        bg: 'from-emerald-500/20 to-teal-500/20',
        text: 'text-emerald-500',
        border: 'border-emerald-500/30',
        hoverBorder: 'hover:border-emerald-400',
        gradient: 'from-emerald-600 to-teal-600',
        icon: ShieldCheck
    },
    ATHLETE: {
        primary: 'blue',
        bg: 'from-blue-500/20 to-indigo-500/20',
        text: 'text-blue-500',
        border: 'border-blue-500/30',
        hoverBorder: 'hover:border-blue-400',
        gradient: 'from-blue-600 to-indigo-600',
        icon: Zap
    }
};

const Login = ({ initialMode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine Mode: 'athlete' or 'coach'
    // Prioritize prop, then URL path check
    const isAthletePath = location.pathname.includes('/student') || location.pathname.includes('/athlete');
    const mode = initialMode || (isAthletePath ? 'athlete' : 'coach');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    // Initial Auth Check
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Verify role and redirect immediately
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                const userRole = profile?.role || 'coach';

                if (isStaffMember(userRole)) {
                    navigate('/workspace/dashboard', { replace: true });
                } else {
                    navigate('/athlete', { replace: true });
                }
            } else {
                setAuthChecking(false);
            }
        };

        // Handle error messages from redirects
        if (location.state?.error) {
            setErrorMsg(location.state.error);
            window.history.replaceState({}, document.title);
        }

        checkSession();
    }, [navigate, location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            // 1. Sign In
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // 2. Role Check
            const uid = data.user.id;
            // Fetch profile
            let { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', uid)
                .single();

            if (!profile) {
                // FALLBACK: Metadata check
                const metaRole = data.user.user_metadata?.role;
                if (metaRole) {
                    console.warn("Profile missing, using metadata fallback.");
                    profile = { role: metaRole };
                } else {
                    // Critical Error
                    throw new Error("SYSTEM ERROR: User profile missing. Please contact support.");
                }
            }

            const userRole = profile.role;
            const isStaff = isStaffMember(userRole);

            // 3. Gatekeeper Logic based on Portal Mode
            // If logging into Athlete Portal but user is Staff -> Block
            if (mode === 'athlete' && isStaff) {
                await supabase.auth.signOut();
                throw new Error("ACCESS DENIED: Staff account detected. Please use the Staff Portal.");
            }

            // If logging into Staff Portal but user is Athlete -> Block
            if (mode === 'coach' && !isStaff) {
                await supabase.auth.signOut();
                throw new Error("ACCESS DENIED: Athlete account detected. Please use the Student Portal.");
            }

            // 4. Success Redirect
            if (isStaff) {
                navigate('/workspace/dashboard');
            } else {
                navigate('/athlete');
            }

        } catch (error) {
            console.error("Login Error:", error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (authChecking) return null; // Or a loading spinner

    // Render Helpers
    const isAthlete = mode === 'athlete';
    const activeTheme = isAthlete ? THEME.ATHLETE : THEME.COACH;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden select-none">

            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">

                {/* ERROR TOAST */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold shadow-lg"
                        >
                            <AlertCircle size={18} />
                            {errorMsg}
                            <button onClick={() => setErrorMsg(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                >
                    {/* DECORATIVE TOP BORDER */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeTheme.gradient}`}></div>

                    {/* BACK BUTTON (To Selection) */}
                    <button
                        onClick={() => navigate('/portal-select')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
                    >
                        <ChevronLeft size={16} /> Switch Portal
                    </button>

                    {/* HEADER */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                            <activeTheme.icon className={`w-8 h-8 ${activeTheme.text}`} />
                            {isAthlete ? 'Welcome, Champion!' : 'Wild Robot Access'}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {isAthlete
                                ? "Sign in to view your progress and schedule."
                                : "Secure login for Academy Staff & Management."
                            }
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:${activeTheme.text} transition-colors`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-medium"
                                    style={{ '--tw-ring-color': isAthlete ? '#3b82f6' : '#10b981' }}
                                    placeholder={isAthlete ? "athlete@academy.com" : "coach@wildrobot.com"}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:${activeTheme.text} transition-colors`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-medium"
                                    style={{ '--tw-ring-color': isAthlete ? '#3b82f6' : '#10b981' }}
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${activeTheme.gradient} hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-4">
                        <Link to="/forgot-password" className="text-sm font-medium text-slate-500 hover:text-white transition-colors block">
                            Forgot your password?
                        </Link>
                        {!isAthlete && (
                            <p className="text-sm text-slate-500">
                                No account? <Link to="/signup" className="text-emerald-500 font-bold hover:underline">Create Academy</Link>
                            </p>
                        )}
                    </div>

                </motion.div>

            </div>

            <div className="absolute bottom-6 text-center w-full text-slate-700 text-[10px] font-mono tracking-widest opacity-50">
                WILD ROBOT SYSTEM v3.2  //  SECURE CONNECTION ESTABLISHED
            </div>
        </div>
    );
};

export default Login;
