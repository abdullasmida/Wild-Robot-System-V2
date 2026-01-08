import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy, CheckCircle, Clock, Zap, Users, BarChart, LayoutDashboard, Shield, Play, Menu, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Landing() {
    const navigate = useNavigate();
    const [activeHub, setActiveHub] = useState('coaching'); // 'coaching' or 'management'
    const [session, setSession] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Feature Lists
    const features = {
        coaching: [
            { icon: <Clock className="w-5 h-5 text-emerald-600" />, text: "Automated Scheduling & Check-ins" },
            { icon: <Trophy className="w-5 h-5 text-emerald-600" />, text: "Skill Tracking & Gamification" },
            { icon: <Zap className="w-5 h-5 text-emerald-600" />, text: "Video Analysis & Feedback" }
        ],
        management: [
            { icon: <Users className="w-5 h-5 text-blue-600" />, text: "Staff Payroll & Hours" },
            { icon: <BarChart className="w-5 h-5 text-blue-600" />, text: "Real-time Financial Reports" },
            { icon: <CheckCircle className="w-5 h-5 text-blue-600" />, text: "Automated Subscription Billing" }
        ]
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100">

            {/* --- 1. NAVBAR --- */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="bg-emerald-600 rounded-xl p-2 transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-emerald-200">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                            Wild Robot
                        </span>
                    </div>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-500">
                        <a href="#" className="hover:text-emerald-600 transition-colors">Platform</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Solutions</a>
                        <button onClick={() => navigate('/pricing')} className="hover:text-emerald-600 transition-colors">Pricing</button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {session ? (
                            <button
                                onClick={() => navigate('/coach/home')}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 hover:-translate-y-0.5"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="hidden md:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors px-4 py-2"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="hidden md:block bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
                                >
                                    Start for free
                                </button>
                                {/* Mobile Menu Toggle */}
                                <button
                                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 bg-white z-[60] flex flex-col"
                        >
                            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="bg-emerald-600 rounded-xl p-2 shadow-lg shadow-emerald-200">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                                        Wild Robot
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto">
                                <nav className="flex flex-col gap-6 text-2xl font-bold text-slate-900">
                                    <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition-colors">Platform</a>
                                    <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition-colors">Solutions</a>
                                    <button onClick={() => { setIsMobileMenuOpen(false); navigate('/pricing'); }} className="text-left hover:text-emerald-600 transition-colors">Pricing</button>
                                </nav>

                                <div className="mt-auto flex flex-col gap-4">
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                                        className="w-full py-4 text-center font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Log in
                                    </button>
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); navigate('/signup'); }}
                                        className="w-full py-4 text-center font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                                    >
                                        Start for free
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* --- 2. HERO SECTION --- */}
            <main className="pt-40 pb-20 px-6 text-center max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        New v3.0 Release
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                        The All-in-One OS for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                            Deskless Sports Teams.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        Manage schedules, track athlete progress, and automate billing.
                        Give your coaches the tools to build champions.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-24">
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 hover:-translate-y-1"
                        >
                            Start 14-Day Free Trial
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => navigate('/login')} // Demo flow usually
                            className="w-full md:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                        >
                            <Play className="w-6 h-6 fill-slate-700" />
                            Watch Demo
                        </button>
                    </div>
                </motion.div>

                {/* --- 3. HUB SWITCHER (Interactive Demo) --- */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden max-w-6xl mx-auto relative ring-1 ring-black/5">

                    {/* Toolbar */}
                    <div className="border-b border-slate-100 bg-slate-50/80 backdrop-blur p-4 flex justify-between items-center">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
                            <button
                                onClick={() => setActiveHub('coaching')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeHub === 'coaching'
                                    ? 'bg-white shadow-sm text-emerald-700'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Coaching Hub
                            </button>
                            <button
                                onClick={() => setActiveHub('management')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeHub === 'management'
                                    ? 'bg-white shadow-sm text-blue-700'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Business Hub
                            </button>
                        </div>
                        <div className="w-16"></div> {/* Spacer */}
                    </div>

                    {/* Content Area */}
                    <div className="p-8 md:p-16 min-h-[500px] flex items-center bg-slate-50">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeHub}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid md:grid-cols-2 gap-16 items-center w-full"
                            >
                                {/* Left: Text Content */}
                                <div className="text-left space-y-8">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${activeHub === 'coaching' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        <Shield className="w-4 h-4" />
                                        {activeHub === 'coaching' ? 'For Coaches' : 'For Owners'}
                                    </div>

                                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                                        {activeHub === 'coaching' ? 'Build Better Athletes.' : 'Run a Profitable Empire.'}
                                    </h3>

                                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                                        {activeHub === 'coaching'
                                            ? 'Everything your coaches need on the field. Plan sessions, track attendance, and evaluate skills in real-time.'
                                            : 'Streamline operations with automated billing, payroll, and powerful financial reporting tools.'}
                                    </p>

                                    <div className="space-y-4">
                                        {features[activeHub].map((feature, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className={`p-2 rounded-lg ${activeHub === 'coaching' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                                    {feature.icon}
                                                </div>
                                                <span className="font-bold text-slate-700">{feature.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Visual Placeholder */}
                                <div className="relative group perspective-1000">
                                    {/* Abstract Background */}
                                    <div className={`aspect-[4/3] rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 transform group-hover:rotate-y-2 group-hover:scale-105 ${activeHub === 'coaching'
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/30'
                                        : 'bg-gradient-to-br from-blue-600 to-indigo-500 shadow-blue-500/30'
                                        }`}>

                                        {/* Mock UI Card */}
                                        <div className="absolute inset-x-8 inset-y-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col gap-4 shadow-inner">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-1/3 h-6 bg-white/40 rounded-full" />
                                                <div className="w-10 h-10 rounded-full bg-white/40" />
                                            </div>

                                            {/* Chart/Content Area */}
                                            <div className="flex-1 bg-white/20 rounded-xl w-full relative overflow-hidden flex items-end justify-around pb-4 px-4 gap-2">
                                                {[40, 70, 50, 90, 60, 80].map((h, idx) => (
                                                    <div key={idx} className="w-full bg-white/30 rounded-t-lg" style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex gap-3">
                                                <div className="flex-1 h-14 rounded-xl bg-white/20" />
                                                <div className="flex-1 h-14 rounded-xl bg-white/20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- 4. FOOTER / TRUST --- */}
                <div className="mt-24 text-slate-400 text-sm font-bold uppercase tracking-widest text-center">
                    Powering Next-Gen Academies
                </div>
            </main>
        </div>
    );
}