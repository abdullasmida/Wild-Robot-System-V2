import React, { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    getDay,
    parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { Session } from './mockData';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MobileCalendarProps {
    sessions: Session[];
}

export const MobileCalendar: React.FC<MobileCalendarProps> = ({ sessions }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart); // 0 = Sunday
    const offset = startDay === 0 ? 6 : startDay - 1;
    const placeholders = Array.from({ length: offset });

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsBottomSheetOpen(true);
    };

    const selectedDaySessions = useMemo(() => {
        if (!selectedDate) return [];
        return sessions.filter(s => isSameDay(parseISO(s.start_time), selectedDate));
    }, [selectedDate, sessions]);

    return (
        <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-none">

            {/* Calendar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-white">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold font-mono tracking-tight text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 px-2 py-3 border-b border-slate-200 bg-slate-50">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-bold text-slate-400">
                        {d}
                    </div>
                ))}
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-7 grid-rows-6 gap-1 p-2 flex-1 relative bg-white">
                {placeholders.map((_, i) => <div key={`ph-${i}`} className="aspect-[4/5] opacity-0 pointer-events-none" />)}

                {daysInMonth.map((day) => {
                    const daySessions = sessions.filter(s => isSameDay(parseISO(s.start_time), day));
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    // Sorting: Conflicts first
                    daySessions.sort((a, b) => (Number(b.wibo_conflict_flag) - Number(a.wibo_conflict_flag)));

                    const MAX_DOTS = 3;
                    const overflow = Math.max(0, daySessions.length - MAX_DOTS);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => handleDayClick(day)}
                            className={cn(
                                "aspect-[4/5] rounded-lg flex flex-col items-center justify-start pt-2 relative transition-all border border-transparent",
                                isSelected
                                    ? "bg-emerald-50 border-emerald-500/50"
                                    : "hover:bg-slate-50 hover:border-slate-200",
                                isToday && "bg-slate-100 border-slate-200"
                            )}
                        >
                            <span className={cn(
                                "text-sm w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors",
                                isToday ? "bg-slate-900 text-white font-bold shadow-lg" : "text-slate-600",
                                isSelected && !isToday && "text-emerald-600 font-bold"
                            )}>
                                {format(day, 'd')}
                            </span>

                            {/* DOTS CONTAINER */}
                            <div className="flex flex-col gap-1 w-full items-center px-1">
                                <div className="flex gap-1 flex-wrap justify-center content-center w-full">
                                    {daySessions.slice(0, MAX_DOTS).map((s, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
                                                s.wibo_conflict_flag
                                                    ? "bg-red-500 animate-pulse"
                                                    : (s.status === 'scheduled' ? "bg-emerald-500" : "bg-slate-300")
                                            )}
                                        />
                                    ))}
                                </div>
                                {overflow > 0 && (
                                    <span className="text-[9px] font-bold text-slate-400 leading-none">+{overflow}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Sheet Drawer */}
            {isBottomSheetOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden h-[100dvh] pointer-events-none">

                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                        onClick={() => setIsBottomSheetOpen(false)}
                    />

                    {/* Sheet */}
                    <div className="relative pointer-events-auto bg-white w-full max-h-[70vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-slate-100">

                        {/* Handle */}
                        <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" onClick={() => setIsBottomSheetOpen(false)}>
                            <div className="w-12 h-1.5 rounded-full bg-slate-200 hover:bg-slate-300" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    {selectedDate && format(selectedDate, 'EEE, MMM do')}
                                    {selectedDaySessions.some(s => s.wibo_conflict_flag) && (
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">{selectedDaySessions.length} Sessions</p>
                            </div>
                            <button onClick={() => setIsBottomSheetOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sessions List */}
                        <div className="overflow-y-auto p-4 pt-0 space-y-3 pb-8 flex-1">
                            {selectedDaySessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Clock className="w-6 h-6 opacity-50" />
                                    </div>
                                    <span className="italic">No events scheduled</span>
                                </div>
                            ) : (
                                selectedDaySessions.map(session => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "relative p-4 rounded-2xl border transition-all shadow-sm",
                                            session.wibo_conflict_flag
                                                ? "bg-red-50 border-red-200 hover:bg-red-100/50"
                                                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                                        )}
                                    >
                                        {/* Left Border Accent */}
                                        <div className={cn(
                                            "absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
                                            session.wibo_conflict_flag ? "bg-red-500" : session.batch.color
                                        )} />

                                        <div className="pl-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 text-base">{session.batch.name}</h4>
                                                {session.wibo_conflict_flag ? (
                                                    <div className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase px-2 py-0.5 bg-red-100 rounded-full border border-red-200">
                                                        <AlertCircle className="w-3 h-3" /> Conflict
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                        {format(parseISO(session.start_time), 'HH:mm')} - {format(parseISO(session.end_time), 'HH:mm')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    <span className="truncate max-w-[100px]">{session.location?.name}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    {session.coach ? (
                                                        <>
                                                            <span className="text-xs text-slate-600 font-medium text-right">{session.coach.full_name}</span>
                                                            <img src={session.coach.avatar_url} className="w-6 h-6 rounded-full border border-slate-200" />
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-amber-600 italic flex items-center gap-1">
                                                            <User className="w-3 h-3" /> Unassigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
