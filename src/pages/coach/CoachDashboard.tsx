import React from 'react';
import { useUser } from '@/context/UserContext';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Trophy, ArrowRight, Activity, ClipboardList } from 'lucide-react';

const CoachDashboard = () => {
    const { profile, loading } = useUser();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* 1. Compact Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden flex items-center justify-between min-h-[160px]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 max-w-xl">
                    <h1 className="text-2xl font-bold mb-1">Hello, {profile?.first_name || 'Coach'} 👋</h1>
                    <p className="text-emerald-50 text-sm font-medium opacity-90 leading-relaxed">
                        Ready to inspire? You have upcoming sessions today.
                        Check your roster for any medical alerts before starting.
                    </p>
                </div>

                {/* Mascot Slot (Placeholder) */}
                <div className="hidden md:flex items-center justify-center w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 mr-8 shrink-0 backdrop-blur-sm relative group">
                    <span className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors cursor-default">Mascot Slot</span>
                    {/* Future 2D Webo Image here */}
                </div>
            </div>

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
