import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Users, DollarSign, Clock, Calendar,
    UserPlus, ClipboardCheck, MessageSquare, CreditCard,
    Bot, TrendingUp, TrendingDown, Bell, ArrowRight, Shield, X
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import Modal from '../../components/ui/Modal';
import AddAthleteModal from '../../components/AddAthleteModal';

export default function CoachHome() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        activeAthletes: 0,
        monthlyRevenue: 0,
        staffCount: 0,
        todaySessions: 0
    });

    // Modals
    const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Get User & Profile
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                let userProfile = null;
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, academy_name')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    userProfile = profileData;
                    setProfile(profileData);
                } else {
                    // Fallback
                    userProfile = {
                        first_name: user.user_metadata?.first_name || 'Coach',
                        academy_name: user.user_metadata?.academy_name || 'Wild Robot Academy'
                    };
                    setProfile(userProfile);
                }

                // 2. Fetch Real Counts (if academy_name exists)
                if (userProfile.academy_name) {
                    // Count Athletes
                    const { count: athleteCount } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('academy_name', userProfile.academy_name)
                        .eq('role', 'athlete');

                    // Count Staff
                    const { count: staffCount } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('academy_name', userProfile.academy_name)
                        .neq('role', 'athlete');

                    setStats(prev => ({
                        ...prev,
                        activeAthletes: athleteCount || 0,
                        staffCount: staffCount || 1
                    }));
                }

            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- SUB-COMPONENTS ---

    const QuickActionButton = ({ icon: Icon, label, variant = 'secondary', onClick }) => {
        const baseStyle = "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95";
        const variants = {
            primary: "bg-emerald-600 text-white hover:bg-emerald-500",
            secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
        };

        return (
            <button onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
                <Icon size={18} />
                {label}
            </button>
        );
    };

    const StatCard = ({ title, value, subtext, trend, icon: Icon, trendUp }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
            </div>
        </div>
    );

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // --- MAIN RENDER ---
    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-emerald-100 relative">

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            Good Morning, {profile?.first_name || 'Coach'}! 👋
                        </h1>
                        <p className="text-sm text-slate-500 font-medium hidden sm:block">
                            <span className="text-emerald-600 font-bold">{profile?.academy_name}</span> Command Center
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* --- 1. QUICK ACTIONS --- */}
                <section className="flex flex-wrap gap-4">
                    <QuickActionButton
                        icon={UserPlus}
                        label="Add Athlete"
                        variant="primary"
                        onClick={() => setShowAddAthleteModal(true)}
                    />
                    <QuickActionButton
                        icon={Shield}
                        label="Add Staff"
                        variant="secondary"
                        onClick={() => navigate('/coach/staff')} // Redirect to Staff Management for adding/promoting
                    />
                    <QuickActionButton
                        icon={Calendar}
                        label="Schedule Session"
                        variant="secondary"
                        onClick={() => navigate('/coach/schedule')}
                    />
                </section>

                {/* --- 2. BUSINESS PULSE --- */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Business Pulse</h2>
                        {stats.activeAthletes > 0 && (
                            <button className="text-emerald-600 text-sm font-bold hover:underline">View Analytics</button>
                        )}
                    </div>

                    {stats.activeAthletes === 0 ? (
                        /* --- EMPTY STATE / WELCOME SLATE --- */
                        /* --- SETUP GUIDE WIDGET (Gamified Onboarding) --- */
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                                <div className="h-full bg-emerald-500 w-[25%]"></div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start pt-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Let's set up your academy</h3>
                                            <p className="text-sm text-slate-500">Complete these steps to unlock your dashboard.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        {/* Step 1: Account (Done) */}
                                        <div className="flex items-center gap-4 opacity-50">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                <ClipboardCheck size={14} />
                                            </div>
                                            <span className="text-slate-900 font-bold line-through decoration-emerald-500">Create Academy Account</span>
                                        </div>

                                        {/* Step 2: Add Athlete (Active) */}
                                        <div className="flex items-center gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 animate-pulse">
                                                <ArrowRight size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-900 font-bold">Add your first athlete</p>
                                                <p className="text-xs text-slate-500">Start building your roster.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowAddAthleteModal(true)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Add Now
                                            </button>
                                        </div>

                                        {/* Step 3: Add Staff */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                            </div>
                                            <span className="text-slate-500 font-medium">Invite Staff Members</span>
                                            <button
                                                onClick={() => navigate('/coach/staff')}
                                                className="ml-auto text-xs font-bold text-emerald-600 hover:underline"
                                            >
                                                Go to Staff
                                            </button>
                                        </div>

                                        {/* Step 4: Schedule */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                            </div>
                                            <span className="text-slate-500 font-medium">Create your first class</span>
                                            <button
                                                onClick={() => navigate('/coach/schedule')}
                                                className="ml-auto text-xs font-bold text-emerald-600 hover:underline"
                                            >
                                                Go to Schedule
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Side */}
                                <div className="hidden md:flex w-1/3 bg-slate-50 rounded-xl p-6 flex-col items-center justify-center text-center border border-slate-100">
                                    <div className="relative w-24 h-24 mb-4">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="25, 100" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-black text-slate-900">25%</span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Setup Progress</p>
                                    <p className="text-xs text-slate-400 mt-1">Complete steps to level up!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- REAL STATS GRID --- */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Active Athletes"
                                value={stats.activeAthletes}
                                trend="-- vs last month"
                                trendUp={true}
                                icon={Users}
                            />
                            <StatCard
                                title="Monthly Revenue"
                                value={`AED ${stats.monthlyRevenue.toLocaleString()}`}
                                trend="-- vs last month"
                                trendUp={true}
                                icon={DollarSign}
                            />
                            <StatCard
                                title="Staff Count"
                                value={stats.staffCount}
                                subtext={`Including you`}
                                icon={Shield}
                            />
                            <StatCard
                                title="Today's Sessions"
                                value={stats.todaySessions}
                                subtext="Scheduled today"
                                icon={Calendar}
                            />
                        </div>
                    )}
                </section>

                {/* --- 3. RECENT ACTIVITY --- */}
                {stats.activeAthletes > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {[1].map((_, i) => (
                                <div key={i} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                            sys
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">System initialized for {profile?.academy_name}</p>
                                            <p className="text-xs text-slate-500">Just now</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 group-hover:text-emerald-600">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            {/* --- WIBO Floating Action Button --- */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-emerald-500 transition-colors group border-4 border-emerald-200"
                onClick={() => alert("WIBO: How can I help you manage your academy today?")}
            >
                <Bot size={32} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
            </motion.button>

            {/* --- MODALS --- */}

            <AddAthleteModal
                isOpen={showAddAthleteModal}
                onClose={() => setShowAddAthleteModal(false)}
                academyName={profile?.academy_name}
                onSuccess={() => {
                    // Refresh data logic if needed
                    window.location.reload();
                }}
            />

            <Modal
                isOpen={showAddStaffModal}
                title="Add Staff Member"
                onClose={() => setShowAddStaffModal(false)}
            >
                <div className="text-center py-8">
                    <p className="text-lg font-bold text-slate-800">Coming Soon</p>
                    <p className="text-slate-500 text-sm mt-2">Staff invites will be sent via email.</p>
                </div>
            </Modal>

        </div>
    );
}
