import React, { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addDays } from 'date-fns';

export default function MasterCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedClass, setSelectedClass] = useState(null);
    const [groups, setGroups] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [filters, setFilters] = useState({
        branch: 'All',
        coach: 'All',
        activity: 'All'
    });

    // Simulated Role (In real app, get from Context/Auth)
    const currentRole = localStorage.getItem('simulated_role') || 'admin';
    const isHeadCoach = currentRole === 'head_coach';

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulate network request
                await new Promise(resolve => setTimeout(resolve, 800));

                // Expanded Mock Data
                setGroups([
                    { id: 1, title: 'Winter Camp', date: '2025-12-16', type: 'Camp', branch: 'Dubai', coach: 'Sarah', time: '09:00 - 12:00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                    { id: 2, title: 'Elite Boys', date: '2025-12-16', type: 'Gymnastics', branch: 'Ajman', coach: 'Abdulla', time: '16:00 - 18:00', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                    { id: 3, title: 'Ajman Squad', date: '2025-12-17', type: 'Gymnastics', branch: 'Ajman', coach: 'Abdulla', time: '17:00 - 19:00', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                    { id: 4, title: 'Judo Basics', date: '2025-12-20', type: 'Judo', branch: 'Dubai', coach: 'Mike', time: '09:00 - 10:30', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                    { id: 5, title: 'Winter Camp', date: '2025-12-17', type: 'Camp', branch: 'Dubai', coach: 'Sarah', time: '09:00 - 12:00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                    { id: 6, title: 'Winter Camp', date: '2025-12-18', type: 'Camp', branch: 'Dubai', coach: 'Sarah', time: '09:00 - 12:00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                ]);

                setCompetitions([
                    { id: 1, title: '🏆 Academy Cup Prep', startDate: '2025-12-15', endDate: '2025-12-20', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                ]);

            } catch (err) {
                console.error("Error fetching calendar data:", err);
                setError("Failed to load schedule. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // 2. Filter Logic
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            // Role Lock: Head Coach sees Gymnastics Only (Example Logic)
            if (isHeadCoach && g.type !== 'Gymnastics') return false;

            // Manual Filters
            if (filters.branch !== 'All' && g.branch !== filters.branch) return false;
            if (filters.coach !== 'All' && g.coach !== filters.coach) return false;
            if (filters.activity !== 'All' && g.type !== filters.activity) return false;

            return true;
        });
    }, [groups, filters, isHeadCoach]);

    // 3. Calendar Grid Calculations
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getBannersForDay = (day) => {
        return competitions?.filter(comp => {
            const start = new Date(comp.startDate);
            const end = new Date(comp.endDate);
            return day >= start && day <= end;
        }) || [];
    };

    // --- Loading & Error UI ---
    if (isLoading) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Loading Schedule...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center space-y-4 text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <span className="material-symbols-outlined text-3xl">wifi_off</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Connection Error</h3>
                <p className="text-slate-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
            {/* --- Header & Filters --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
                        Master Calendar
                        {isHeadCoach && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 uppercase tracking-wide">Head Coach Mode</span>}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base">
                        {isHeadCoach ? "Overseeing Gymnastics Operations" : "Full Operational Command"}
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    {/* Branch Filter */}
                    <select
                        className="bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100 py-2 pl-3 pr-8"
                        value={filters.branch}
                        onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
                    >
                        <option value="All">All Branches</option>
                        <option value="Dubai">Dubai Campus</option>
                        <option value="Ajman">Ajman Campus</option>
                    </select>

                    {/* Coach Filter (Hidden for Head Coach if strict) */}
                    <select
                        className="bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100 py-2 pl-3 pr-8"
                        value={filters.coach}
                        onChange={(e) => setFilters(prev => ({ ...prev, coach: e.target.value }))}
                    >
                        <option value="All">All Coaches</option>
                        <option value="Abdulla">Abdulla</option>
                        <option value="Sarah">Sarah</option>
                        <option value="Mike">Mike</option>
                    </select>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                        <button className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
                        <span className="text-sm font-black text-slate-800 min-w-[100px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
                        <button className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
                    </div>
                </div>
            </div>

            {/* --- Mobile View: Agenda List (Fallback) --- */}
            <div className="md:hidden flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-xs">
                    Upcoming Agenda
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                            <p className="text-sm font-bold">No events found</p>
                        </div>
                    ) : (
                        filteredGroups.map(event => (
                            <div key={event.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex flex-col items-center justify-center w-12 bg-white rounded-lg border border-slate-200 shrink-0 h-14">
                                    <span className="text-[10px] text-red-500 font-bold uppercase">{format(new Date(event.date), 'MMM')}</span>
                                    <span className="text-xl font-black text-slate-900">{format(new Date(event.date), 'd')}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{event.title}</h4>
                                    <p className="text-xs text-slate-500">{event.time} • {event.coach}</p>
                                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-md border mt-1 inline-block", event.color)}>
                                        {event.type}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- Desktop View: Dense Grid --- */}
            <div className="hidden md:flex flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-col">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 h-10">
                    {weekDays.map(day => (
                        <div key={day} className="flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-slate-100 gap-px">
                    {calendarDays.map((day) => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayEvents = filteredGroups.filter(g => g.date === dayStr);
                        const dayBanners = getBannersForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                className={clsx(
                                    "bg-white relative p-1 flex flex-col gap-0.5 transition-all hover:bg-blue-50/30",
                                    !isCurrentMonth && "bg-slate-50 text-slate-300"
                                )}
                            >
                                {/* Date Number */}
                                <span className={clsx(
                                    "absolute top-1 right-1 text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full z-10",
                                    isToday ? "bg-red-500 text-white" : "text-slate-400"
                                )}>
                                    {format(day, 'd')}
                                </span>

                                {/* Banners (Full Width) */}
                                {dayBanners.map(banner => (
                                    <div key={banner.id} className={clsx("text-[9px] font-bold px-1 rounded-sm truncate border", banner.color)}>
                                        {banner.title}
                                    </div>
                                ))}

                                {/* Events (Dense) */}
                                <div className="mt-5 flex flex-col gap-0.5 overflow-y-auto max-h-[120px] scrollbar-hide">
                                    {dayEvents.map(event => (
                                        <button
                                            key={event.id}
                                            onClick={() => setSelectedClass(event)}
                                            className={clsx(
                                                "text-left text-[9px] font-medium px-1.5 py-1 rounded border leading-tight transition-all hover:scale-[1.02] active:scale-95",
                                                event.color
                                            )}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold truncate">{event.time}</span>
                                            </div>
                                            <div className="truncate font-bold opacity-90">{event.title}</div>
                                            <div className="opacity-75 truncate">{event.coach}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- Class Detail Modal --- */}
            {selectedClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedClass(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">{selectedClass.title}</h3>
                                <p className="text-sm text-slate-500 font-medium">{selectedClass.time} • {selectedClass.branch}</p>
                            </div>
                            <span className={clsx("text-xs font-bold px-2 py-1 rounded-lg uppercase", selectedClass.color)}>
                                {selectedClass.type}
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">sports_gymnastics</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Coach: {selectedClass.coach}</p>
                                    <p className="text-xs text-slate-400">12 Students Enrolled</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                    Take Attendance
                                </button>
                                <button className="w-full py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:border-slate-300 hover:text-slate-800 transition-colors">
                                    View Skills
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
