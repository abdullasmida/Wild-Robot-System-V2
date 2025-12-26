import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // Simulated Data
    const user = {
        name: "Coach John",
        role: "Head Coach",
        branch: "Sharjah Elite",
        joinDate: "September 2023",
        stats: [
            { label: "Active Athletes", value: "124", trend: "+12%", icon: "groups", color: "from-blue-500 to-blue-600" },
            { label: "Training Hours", value: "86h", trend: "This Month", icon: "timer", color: "from-emerald-500 to-emerald-600" },
            { label: "Performance Score", value: "9.8", trend: "Top 5%", icon: "star", color: "from-amber-500 to-amber-600" },
            { label: "Revenue Generated", value: "AED 45k", trend: "+8.5%", icon: "payments", color: "from-purple-500 to-purple-600" },
        ],
        activity: [
            { action: "Updated Attendance", target: "Elite Squad", time: "2 hours ago", icon: "edit_calendar" },
            { action: "New Registration", target: "Sarah Connor", time: "5 hours ago", icon: "person_add" },
            { action: "Generated Invoice", target: "#INV-2024-001", time: "1 day ago", icon: "receipt_long" },
            { action: "Syllabus Update", target: "Gymnastics Level 3", time: "2 days ago", icon: "menu_book" },
        ]
    };

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800);
    }, []);

    if (isLoading) return <LoadingSkeleton />;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-8">
            {/* Banner Section */}
            <div className="relative h-64 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6">
                    <div className="flex items-end gap-6 translate-y-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 shadow-2xl shadow-emerald-900/20 ring-4 ring-white">
                                <div className="h-full w-full rounded-xl bg-slate-800 flex items-center justify-center text-white text-4xl font-black overflow-hidden relative">
                                    {/* Placeholder Image or Initials */}
                                    <span className="z-10">JP</span>
                                    <div className="absolute inset-0 bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=John')] bg-cover opacity-20"></div>
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-slate-600 text-sm">photo_camera</span>
                            </div>
                        </div>

                        {/* Identity */}
                        <div className="mb-2 text-white">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-slate-400 font-medium flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-[16px]">apartment</span>
                                {user.branch}
                                <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                                Member since {user.joinDate}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="ml-auto hidden md:flex items-center gap-3 mb-2">
                            <button onClick={() => navigate('/coach/settings')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm backdrop-blur-md transition-all border border-white/10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">settings</span>
                                Settings
                            </button>
                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer for overlapping avatar */}
            <div className="h-12 md:h-16"></div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {user.stats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={clsx("h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg text-white", stat.color)}>
                                        <span className="material-symbols-outlined">{stat.icon}</span>
                                    </div>
                                    {stat.trend && (
                                        <span className={clsx("text-xs font-bold px-2 py-1 rounded-full", stat.trend.includes('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                            </div>
                            {/* Decorative Blur */}
                            <div className={clsx("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity bg-gradient-to-br", stat.color)}></div>
                        </div>
                    ))}
                </div>

                {/* Split Section: Details & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: ID Card style details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900">Professional Identity</h3>
                                <button
                                    onClick={() => alert("Public Profile Preview: Coming soon in Phase 2!")}
                                    className="text-emerald-500 text-sm font-bold hover:underline"
                                >
                                    View Public Profile
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField label="Full Name" value={user.name} icon="id_card" />
                                <InfoField label="Email Address" value="john.p@wildrobot.com" icon="mail" />
                                <InfoField label="Phone Number" value="+971 50 123 4567" icon="call" />
                                <InfoField label="Employee ID" value="WR-2023-884" icon="badge" />
                                <InfoField label="Department" value="Coaching & Athletics" icon="domain" />
                                <InfoField label="Location" value="Sharjah, UAE" icon="location_on" />
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Certifications & Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['FIG Level 2', 'First Aid Certified', 'Child Safety', 'Team Management', 'Swimming L3'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-default transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Activity Log */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">history</span>
                                Recent Activity
                            </h3>

                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-6 pb-2">
                                {user.activity.map((item, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[31px] bg-white border-2 border-slate-100 p-1 rounded-full h-8 w-8 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[14px] text-slate-400">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{item.action}</p>
                                            <p className="text-xs text-slate-500 mb-1">{item.target}</p>
                                            <p className="text-[10px] bg-slate-50 inline-block px-2 py-0.5 rounded text-slate-400 font-medium">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                                View Full History
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function InfoField({ label, value, icon }) {
    return (
        <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 animate-pulse">
            <div className="h-64 bg-slate-200"></div>
            <div className="max-w-7xl mx-auto px-4 -mt-16 space-y-8">
                <div className="h-32 w-32 bg-slate-300 rounded-2xl border-4 border-white"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-xl"></div>)}
                </div>
            </div>
        </div>
    );
}
