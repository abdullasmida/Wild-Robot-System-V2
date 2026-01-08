import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const LoginSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden select-none">
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-block p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome Back.</h1>
                    <p className="text-slate-400 font-medium">Select your portal to continue.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid gap-4"
                >
                    {/* STAFF CARD -> /login */}
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <div className="flex items-center justify-between pointer-events-none">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Staff & Coaches</h3>
                                    <p className="text-slate-500 text-xs font-medium">Management & Operations</p>
                                </div>
                            </div>
                            <ArrowRight className="text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>

                    {/* STUDENT CARD -> /student/login */}
                    <button
                        onClick={() => navigate('/student/login')}
                        className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <div className="flex items-center justify-between pointer-events-none">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Student Portal</h3>
                                    <p className="text-slate-500 text-xs font-medium">Athlete Dashboard</p>
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
            </div>

            <div className="absolute bottom-6 text-center w-full text-slate-700 text-[10px] font-mono tracking-widest opacity-50">
                WILD ROBOT SYSTEM v3.2  //  PORTAL SELECTION
            </div>
        </div>
    );
};

export default LoginSelection;
