import React from 'react';
import { useUser } from '@/context/UserContext';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Trophy, ArrowRight, Activity, ClipboardList } from 'lucide-react';

const CoachDashboard = () => {
    const { profile, academy, loading: userLoading } = useUser();
    const { activeSession, upcomingSession, loading: sessionLoading } = useCurrentSession();

    const loading = userLoading || sessionLoading;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Default Brand Color
    const brandColor = academy?.brand_color || '#10b981';

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* 1. Dynamic Hero Section */}
            {activeSession ? (
                // --- ACTIVE SESSION CARD ---
                <div
                    className="relative rounded-2xl p-6 text-white shadow-lg overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[180px] animate-in fade-in slide-in-from-top-4 duration-700"
                    style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd, #0f172a)` }}
                >
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-3 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            Live Now
                        </div>
                        <h1 className="text-3xl font-black mb-1 capitalize tracking-tight">
                            {(activeSession as any).batch?.name || 'Class Session'}
                        </h1>
                        <p className="text-white/80 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                            <Activity className="w-4 h-4" />
                            {activeSession.start_time.slice(0, 5)} - {activeSession.end_time.slice(0, 5)} • {(activeSession as any).batch?.program?.name || 'General'}
                        </p>
                    </div>

                    <div className="relative z-10 mt-6 md:mt-0 flex flex-col items-center gap-3">
                        <Link
                            to={`/staff/session/${(activeSession as any).id}`}
                            className="group relative px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-sm uppercase tracking-wide shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Enter Class <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </Link>
                        <span className="text-xs font-medium text-white/60">
                            {/* Potential: "XX Athletes checked in" */}
                            Tap to manage attendance
                        </span>
                    </div>
                </div>
            ) : upcomingSession ? (
                // --- UPCOMING SESSION CARD ---
                <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex-1 relative z-10">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-emerald-500" />
                            Up Next Today
                        </h2>
                        <h1 className="text-2xl font-black text-slate-900 mt-1">
                            {(upcomingSession as any).batch?.name}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            Starts at <span className="text-slate-900 font-bold bg-slate-100 px-1 rounded">{upcomingSession.start_time.slice(0, 5)}</span> • {(upcomingSession as any).batch?.program?.name}
                        </p>
                    </div>

                    <div className="relative z-10">
                        <Link
                            to={`/staff/session/${(upcomingSession as any).id}`} // Or just schedule
                            className="px-6 py-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            View Details <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                // --- EMPTY STATE (Standard Hero) ---
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden flex items-center justify-between min-h-[160px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10 max-w-xl">
                        <h1 className="text-2xl font-bold mb-1">Hello, {profile?.first_name || 'Coach'} 👋</h1>
                        <p className="text-slate-300 text-sm font-medium opacity-90 leading-relaxed">
                            You're all caught up! No sessions scheduled for the rest of the day.
                            Take a moment to review upcoming plans or student progress.
                        </p>
                    </div>
                    {/* Mascot Slot */}
                    <div className="hidden md:flex items-center justify-center w-32 h-32 bg-white/5 rounded-full border-2 border-white/10 mr-8 shrink-0 backdrop-blur-sm relative group">
                        <span className="text-3xl">☕</span>
                    </div>
                </div>
            )}

            {/* 2. Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/staff/schedule" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">View Schedule</h3>
                        <p className="text-xs text-slate-500">My Classes</p>
                    </div>
                </Link>

                <Link to="/staff/athletes" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">Roster</h3>
                        <p className="text-xs text-slate-500">My Athletes</p>
                    </div>
                </Link>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group flex items-center gap-4 cursor-pointer opacity-70 hover:opacity-100">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Skills</h3>
                        <p className="text-xs text-slate-500">Evaluations</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group flex items-center gap-4 cursor-pointer opacity-70 hover:opacity-100">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Attendance</h3>
                        <p className="text-xs text-slate-500">Quick Log</p>
                    </div>
                </div>
            </div>

            {/* 3. Recent Updates Stub */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        Today's Beat
                    </h3>
                </div>
                <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                        <CalendarDays className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No urgent alerts for today.</p>
                    <p className="text-slate-400 text-xs mt-1">Check your schedule for class specifics.</p>
                </div>
            </div>
        </div>
    );
};

export default CoachDashboard;
