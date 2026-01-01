import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle, CheckSquare, User, Zap, Trophy, ShieldCheck, UserCheck, Shield, ChevronLeft } from 'lucide-react';
import { supabase } from '../../supabaseClient';

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

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [mode, setMode] = useState(null); // null (selection) | 'coach' | 'athlete'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [rememberMe, setRememberMe] = useState(true);

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

                if (userRole === 'athlete') {
                    navigate('/athlete', { replace: true });
                } else {
                    // Let the Traffic Cop (ProtectedRoute) decide where they go
                    navigate('/owner/dashboard', { replace: true });
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
            let { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', uid)
                .single();

            if (!profile) {
                // FALLBACK: If RLS blocks profile read or it doesn't exist, check User Metadata.
                // This prevents "User Profile Missing" lockout for valid Auth users.
                const metaRole = data.user.user_metadata?.role;
                if (metaRole) {
                    // We found a role in metadata, let's use it temporarily
                    console.warn("Profile missing, using metadata fallback.");
                    profile = { role: metaRole };
                } else {
                    throw new Error("SYSTEM ERROR: User profile missing and no metadata role found.");
                }
            }

            const userRole = profile.role;

            // 3. Gatekeeper Logic
            if (mode === 'athlete' && userRole !== 'athlete') {
                await supabase.auth.signOut();
                throw new Error("ACCESS DENIED: Coach account detected. Please use the Coach Portal.");
            }

            if (mode === 'coach' && userRole === 'athlete') {
                await supabase.auth.signOut();
                throw new Error("ACCESS DENIED: Athlete account detected. Please use the Athlete Portal.");
            }

            // 4. Success Redirect
            if (userRole === 'athlete') {
                navigate('/athlete');
            } else {
                // Check if Academy is set up
                // Let the Guard handle the setup check
                navigate('/owner/dashboard');
            }

        } catch (error) {
            console.error("Login Error:", error);
            setErrorMsg(error.message);
            // Shake effect or visual feedback could be added here
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

                {/* HEADLINE (Only show in selection mode or transition it) */}
                <AnimatePresence mode="wait">
                    {!mode && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center mb-10"
                        >
                            <div className="inline-block p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome Back.</h1>
                            <p className="text-slate-400 font-medium">Select your portal to continue.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                <AnimatePresence mode="wait">

                    {/* --- VIEW 1: SELECTION CARDS --- */}
                    {!mode ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="grid gap-4"
                        >
                            {/* COACH CARD */}
                            <button
                                onClick={() => setMode('coach')}
                                className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="flex items-center justify-between pointer-events-none">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Staff Portal</h3>
                                            <p className="text-slate-500 text-xs font-medium">Management & Operations Dashboard</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>

                            {/* ATHLETE CARD */}
                            <button
                                onClick={() => setMode('athlete')}
                                className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="flex items-center justify-between pointer-events-none">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Athlete Portal</h3>
                                            <p className="text-slate-500 text-xs font-medium">Training & Progress</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>

                            <div className="mt-8 text-center">
                                <Link to="/" className="text-xs font-bold text-slate-600 hover:text-white transition-colors uppercase tracking-widest">
                                    ← Return to Home
                                </Link>
                            </div>
                        </motion.div>
                    ) : (

                        /* --- VIEW 2: LOGIN FORM --- */
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            {/* DECORATIVE TOP BORDER */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeTheme.gradient}`}></div>

                            {/* BACK BUTTON */}
                            <button
                                onClick={() => { setErrorMsg(null); setMode(null); }}
                                className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>

                            {/* HEADER */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                                    <activeTheme.icon className={`w-8 h-8 ${activeTheme.text}`} />
                                    {isAthlete ? 'Athlete Access' : 'Welcome Back'}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    Enter your credentials to access the
                                    <span className={`font-bold ${activeTheme.text}`}> Workspace</span>.
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
                                            placeholder="name@wildrobot.com"
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
                    )}
                </AnimatePresence>

            </div>

            <div className="absolute bottom-6 text-center w-full text-slate-700 text-[10px] font-mono tracking-widest opacity-50">
                WILD ROBOT SYSTEM v3.1  //  SECURE CONNECTION ESTABLISHED
            </div>
        </div>
    );
};

export default Login;
