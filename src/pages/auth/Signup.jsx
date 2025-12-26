import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, Loader2, Star, ShieldCheck } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: fullName,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        role: 'coach'
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                // Success! Redirect to Setup Wizard
                navigate('/setup');
            }

        } catch (error) {
            console.error("Signup Error:", error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-slate-50 flex font-sans">

            {/* --- LEFT SIDE: FEATURE SHOWCASE (Hidden on mobile) --- */}
            <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">

                {/* Background FX */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[120px]"></div>

                {/* Brand */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-emerald-500 rounded-lg p-1.5">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Wild Robot</span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 space-y-8">
                    <h1 className="text-4xl lg:text-5xl font-black leading-tight">
                        A small step for you, <br />
                        a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">giant leap</span> for your team.
                    </h1>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-slate-300 font-medium text-lg">
                            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><CheckCircle size={20} /></div>
                            Automated Scheduling
                        </div>
                        <div className="flex items-center gap-4 text-slate-300 font-medium text-lg">
                            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><CheckCircle size={20} /></div>
                            Skill Tracking & Reports
                        </div>
                        <div className="flex items-center gap-4 text-slate-300 font-medium text-lg">
                            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><CheckCircle size={20} /></div>
                            Payroll & Invoicing
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10 bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700">
                    <div className="flex gap-1 mb-3 text-amber-400">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                    </div>
                    <p className="text-slate-300 italic mb-4">"This platform completely transformed how we run our gymnastics academy. It's like having a superpower."</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">SJ</div>
                        <div>
                            <p className="font-bold text-white text-sm">Sarah Jenkins</p>
                            <p className="text-slate-400 text-xs">Head Coach, Elite Gym</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: FORM --- */}
            <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 md:p-12 relative">
                <div className="w-full max-w-md space-y-8">

                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Create your account</h2>
                        <p className="text-slate-500 font-medium">Start your 14-day free trial. No credit card required.</p>
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl flex gap-3 items-start text-sm font-bold"
                            >
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSignup} className="space-y-6">

                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Business Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Create Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 8 characters"
                                minLength={8}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>GET STARTED <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-slate-500 font-medium">
                            Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Log in</Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Signup;
