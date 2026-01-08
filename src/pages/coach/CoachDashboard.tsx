import React from 'react';
import { useUser } from '@/context/UserContext';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Trophy, ArrowRight } from 'lucide-react';

const CoachDashboard = () => {
    const { profile } = useUser();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Ready to inspire, {profile?.first_name || 'Coach'}?</h1>
                    <p className="text-emerald-100 max-w-lg text-lg">
                        You have full access to your schedule and roster. Check your upcoming sessions and get ready to lead.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link to="/coach/schedule" className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl shadow-sm hover:shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2">
                            <CalendarDays className="w-5 h-5" />
                            View Schedule
                        </Link>
                        <Link to="/coach/athletes" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-sm">
                            <Users className="w-5 h-5" />
                            Manage Roster
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats / shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Today's Classes</h3>
                    <p className="text-sm text-slate-500">Check who is attending and class details.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">My Athletes</h3>
                    <p className="text-sm text-slate-500">Track progress and update skill evaluations.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Assessments</h3>
                    <p className="text-sm text-slate-500">Perform skill checks and evaluations.</p>
                </div>
            </div>

            {/* Recent Updates Stub */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Recent Academy Updates</h3>
                    <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="p-8 text-center text-slate-400 text-sm font-medium">
                    No new announcements.
                </div>
            </div>
        </div>
    );
};

export default CoachDashboard;
