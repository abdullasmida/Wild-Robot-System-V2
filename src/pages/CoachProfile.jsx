import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function CoachProfile() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Mock Loading Effect
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        { label: 'Active Athletes', value: '115', icon: 'group', color: 'text-emerald-500' },
        { label: 'This Month', value: '82h', icon: 'schedule', color: 'text-blue-500' },
        { label: 'Invoiced', value: 'AED 12k', icon: 'payments', color: 'text-amber-500' },
    ];

    if (loading) return <ProfileSkeleton />;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-8 pb-16 shadow-lg">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="h-24 w-24 rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-white/10 backdrop-blur-sm">
                        <div className="h-full w-full flex items-center justify-center text-white text-3xl font-black">
                            JP
                        </div>
                    </div>
                    <div className="text-white">
                        <h1 className="text-3xl font-black tracking-tight mb-1">Coach John</h1>
                        <p className="font-medium text-emerald-100 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Head Coach
                        </p>
                        <p className="text-xs text-emerald-200 mt-1 uppercase tracking-wider font-bold opacity-80">Sharjah Branch</p>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-3">
                    <button className="text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>

            {/* Main Content (Overlapping Hero) */}
            <div className="px-4 -mt-8 relative z-20 space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className={clsx("material-symbols-outlined text-[24px] mb-2", stat.color)}>{stat.icon}</span>
                            <span className="text-xl font-black text-slate-900 leading-none mb-1">{stat.value}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Tools & Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <ProfileLink icon="settings" label="App Settings" onClick={() => navigate('/settings')} />
                    <div className="h-[1px] bg-gray-50 mx-4"></div>
                    <ProfileLink icon="calendar_month" label="My Schedule" onClick={() => navigate('/schedule')} />
                    <div className="h-[1px] bg-gray-50 mx-4"></div>
                    <ProfileLink icon="description" label="My Payslips" onClick={() => alert("Payslips PDF")} />
                    <div className="h-[1px] bg-gray-50 mx-4"></div>
                    <ProfileLink icon="help" label="Support" onClick={() => alert("Support Chat")} />
                </div>

                {/* Logout */}
                <button
                    onClick={() => console.log('Logging out...')}
                    className="w-full bg-white text-red-500 font-bold py-4 rounded-2xl shadow-sm border border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Log Out
                </button>

                <p className="text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                    Wild Robot System v3.1.0
                </p>
            </div>
        </div>
    );
}

function ProfileLink({ icon, label, onClick }) {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group">
            <div className="h-10 w-10 rounded-full bg-gray-100 text-slate-500 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="flex-1 font-bold text-slate-700">{label}</span>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
        </button>
    );
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24 animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="px-4 -mt-8 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-300 rounded-2xl"></div>)}
                </div>
                <div className="h-64 bg-gray-300 rounded-2xl"></div>
            </div>
        </div>
    );
}
