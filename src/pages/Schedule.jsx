import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, MapPin,
    Calendar as CalIcon, Coffee, User, WifiOff, RefreshCw
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { supabase } from '../supabaseClient';

export default function Schedule() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // 🔴 New: Error State
    const [activeFilter, setActiveFilter] = useState('All');

    // 1. Branch Colors
    const BRANCH_COLORS = {
        'Ajman Academy': 'bg-pink-500 border-pink-500',
        'VISS Tilal': 'bg-blue-500 border-blue-500',
        'Sharjah Branch': 'bg-rose-500 border-rose-500',
        'default': 'bg-emerald-500 border-emerald-500'
    };

    // 2. Fetch Logic
    useEffect(() => {
        fetchSessions(selectedDate);
    }, [selectedDate]);

    const fetchSessions = async (date) => {
        setLoading(true);
        setError(null); // Reset error before fetching
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const { data, error: dbError } = await supabase
                .from('sessions')
                .select(`
                    *,
                    coach:profiles (full_name, avatar_url),
                    enrollments (count)
                `)
                .gte('start_time', startOfDay.toISOString())
                .lte('start_time', endOfDay.toISOString())
                .order('start_time', { ascending: true });

            if (dbError) throw dbError;
            setSessions(data || []);

        } catch (err) {
            console.error('Fetch Error:', err);
            // 🔴 UX Improvement: User-friendly error message
            setError('Failed to load schedule. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    const handleManageSession = (session) => {
        navigate(`/session/${session.id}`, {
            state: {
                branch: session.branch,
                level: session.level,
                title: session.title
            }
        });
    };

    const filteredSessions = activeFilter === 'All'
        ? sessions
        : sessions.filter(s => s.branch === activeFilter);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between bg-slate-100 rounded-2xl p-1.5">
                        <button onClick={handlePrevDay} className="p-3 bg-white rounded-xl shadow-sm hover:scale-105 transition-transform text-slate-600">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-black text-slate-800">
                                {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}
                            </h2>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {format(selectedDate, 'MMM do, yyyy')}
                            </span>
                        </div>
                        <button onClick={handleNextDay} className="p-3 bg-white rounded-xl shadow-sm hover:scale-105 transition-transform text-slate-600">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-md mx-auto px-4 mt-6">

                {/* 🔴 ERROR STATE (The Fix) */}
                {error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <WifiOff size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Connection Failed</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-[200px]">{error}</p>
                        <button
                            onClick={() => fetchSessions(selectedDate)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-transform"
                        >
                            <RefreshCw size={18} /> Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                ) : filteredSessions.length > 0 ? (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="overflow-x-auto hide-scrollbar flex gap-2 mb-4">
                            {['All', 'Ajman Academy', 'Sharjah Branch'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                                        activeFilter === filter
                                            ? "bg-slate-800 text-white shadow-md"
                                            : "bg-white text-slate-500 border border-slate-200"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {filteredSessions.map((session) => {
                            const startTime = format(parseISO(session.start_time), 'h:mm a');
                            const endTime = format(parseISO(session.end_time), 'h:mm a');
                            const branchColor = BRANCH_COLORS[session.branch] || BRANCH_COLORS['default'];

                            return (
                                <div key={session.id} className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                    <div className={clsx("absolute top-0 left-0 bottom-0 w-1.5", branchColor)}></div>
                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <div>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">
                                                <MapPin size={10} /> {session.branch}
                                            </span>
                                            <h3 className="text-xl font-black text-slate-800 leading-tight">{session.title}</h3>
                                            <p className="text-xs font-bold text-emerald-600 mt-1">{session.level || 'Open Level'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg shadow-slate-200">
                                                {startTime}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 text-center">to {endTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-2 pl-2">
                                        <div className="flex items-center gap-2">
                                            {session.coach?.avatar_url ? (
                                                <img src={session.coach.avatar_url} alt="Coach" className="w-6 h-6 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User size={12} />
                                                </div>
                                            )}
                                            <span className="text-xs font-bold text-slate-500">
                                                {session.coach?.full_name || 'Assigned Coach'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">group</span>
                                            <span className="text-xs font-bold">{session.enrollments?.[0]?.count || 0}/{session.max_capacity || 20}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleManageSession(session)}
                                        className="w-full mt-4 bg-slate-50 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:bg-slate-900 group-hover:text-white"
                                    >
                                        Manage Class
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Empty State (No Classes)
                    <div className="flex flex-col items-center justify-center text-center opacity-60 mt-10">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <Coffee size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Classes Found</h3>
                        <p className="text-sm text-slate-500 max-w-[200px]">
                            Looks like a rest day! Try selecting another date.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}