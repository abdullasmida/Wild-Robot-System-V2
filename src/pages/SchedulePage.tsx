import React, { useEffect, useState } from 'react';
import { SchedulerBoard } from '../components/scheduler/SchedulerBoard'; // Timeline Board
import { MobileCalendar } from '../components/scheduler/MobileCalendar';
import { fetchWeekSessions, Session } from '../components/scheduler/mockData';
import { Calendar, LayoutList, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, subDays } from 'date-fns';

export default function SchedulePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewDate, setViewDate] = useState(new Date());

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchWeekSessions();
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="h-full flex flex-col bg-slate-950">

            {/* Header Controls (Shared) */}
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">

                {/* Date Nav */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-800 rounded-lg p-0.5">
                        <button onClick={() => setViewDate(subDays(viewDate, 7))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewDate(new Date())} className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white border-x border-slate-700/50">
                            Today
                        </button>
                        <button onClick={() => setViewDate(addDays(viewDate, 7))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <h1 className="hidden md:block text-lg font-bold text-slate-100 ml-2">
                        {format(viewDate, 'MMMM yyyy')}
                    </h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button onClick={loadData} className="p-2 text-slate-500 hover:text-emerald-400 transition-colors" title="Refresh">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </button>

                    <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700/50">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 shadow-sm text-xs font-bold text-white">
                            <LayoutList className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Timeline</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-400 hover:text-white text-xs font-medium transition-colors">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Month</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {loading && sessions.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-20 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : null}

                {/* Mobile View: Month Calendar */}
                <div className="md:hidden h-full overflow-y-auto">
                    <MobileCalendar sessions={sessions} />
                </div>

                {/* Desktop View: Timeline Board */}
                <div className="hidden md:block h-full">
                    <SchedulerBoard />
                    {/* In production prop drilling would pass 'sessions' and 'viewDate' to SchedulerBoard */}
                </div>
            </div>
        </div>
    );
}
