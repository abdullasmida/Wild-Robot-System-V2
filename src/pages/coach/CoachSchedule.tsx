import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    isBefore,
    isAfter,
    startOfDay
} from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CoachSchedule = () => {
    const { user } = useUser();
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchShifts = async () => {
            if (!user) return;

            setLoading(true);
            try {
                // Fetch shifts for a broad range (e.g. current month +/- 1 month window to be safe)
                // For simplicity, fetching all 'active' shifts could work if dataset isn't huge, 
                // but let's stick to a reasonable window if possible. 
                // For now, let's fetch ALL shifts to ensure history dots work.

                const { data, error } = await supabase
                    .from('staff_shifts')
                    // Simplified query to fix 400 Error (Relationship mismatch)
                    // TODO: Restore locations join once FK is verified.
                    // Fetch shifts with location names
                    .select('*, locations ( name )')
                    .eq('staff_id', user.id)
                    .order('start_time', { ascending: true });

                if (error) throw error;
                setShifts(data || []);

            } catch (err) {
                console.error("Error loading schedule:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchShifts();
    }, [user]);

    // --- Helpers ---

    const getMonthDays = () => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    };

    const getDayShifts = (date: Date) => {
        return shifts.filter(shift => isSameDay(parseISO(shift.start_time), date));
    };

    const getDayStatus = (date: Date) => {
        const dayShifts = getDayShifts(date);
        if (dayShifts.length === 0) return 'empty';

        const now = new Date();

        // Check for "Live" (Any shift currently happening)
        const isLive = dayShifts.some(s =>
            isBefore(parseISO(s.start_time), now) &&
            isAfter(parseISO(s.end_time), now)
        );
        if (isLive) return 'live'; // Orange

        // Check for "Missed" (Past start time, but status is not completed/clocked-in)
        // Assuming 'completed' or 'active' status logic. 
        // If status is still 'assigned' and time passed -> Red
        const hasMissed = dayShifts.some(s =>
            isBefore(parseISO(s.end_time), now) &&
            s.status !== 'completed'
        );
        if (hasMissed) return 'missed'; // Red

        // Check for "Done" (All past shifts are completed)
        const isAllDone = dayShifts.every(s => s.status === 'completed');
        if (isAllDone && isBefore(date, startOfDay(now))) return 'done'; // Green

        // Future
        if (isAfter(date, startOfDay(now))) return 'future'; // Grey

        return 'pending'; // Today but not started yet?
    };

    const getPulseDotColor = (status: string) => {
        switch (status) {
            case 'live': return 'bg-amber-500 animate-pulse ring-2 ring-amber-200';
            case 'missed': return 'bg-red-500';
            case 'done': return 'bg-emerald-500';
            case 'future': return 'bg-slate-300';
            case 'pending': return 'bg-blue-400';
            default: return 'hidden';
        }
    };

    // --- Render ---

    const selectedDayShifts = getDayShifts(selectedDate);
    const monthDays = getMonthDays();

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20"> {/* Mobile Width Optimized */}

            {/* Header / Month Nav */}
            <div className="flex items-center justify-between px-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {format(currentDate, 'MMMM yyyy')}
                </h1>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                </div>
            </div>

            {/* MONTH MATRIX */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-2">
                    {/* Add empty slots for start offset if needed (skipped for simplicity, but cleaner with startDay offset) */}
                    {/* Ideally we pad the start, but let's just render days for now */}

                    {monthDays.map((day, i) => {
                        const status = getDayStatus(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);

                        return (
                            <div key={i} className="flex flex-col items-center">
                                <button
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all relative
                                        ${isSelected
                                            ? 'bg-slate-900 text-white shadow-lg scale-110 z-10'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }
                                        ${isTodayDate && !isSelected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : ''}
                                    `}
                                >
                                    {format(day, 'd')}

                                    {/* THE PULSE DOT */}
                                    {status !== 'empty' && (
                                        <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${getPulseDotColor(status)}`} />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SELECTED DAY DETAILS */}
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-slate-800">
                        {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM do')}
                    </h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {selectedDayShifts.length} Sessions
                    </span>
                </div>

                {selectedDayShifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-slate-300">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 font-medium text-sm">No sessions scheduled.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selectedDayShifts.map(shift => (
                            <div key={shift.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                                {/* Status Indicator Stripe (Left) */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${shift.status === 'completed' ? 'bg-emerald-500' :
                                    shift.status === 'in_progress' ? 'bg-amber-500' :
                                        'bg-slate-200'
                                    }`} />

                                {/* Time Box */}
                                <div className="flex flex-col items-center justify-center min-w-[60px]">
                                    <span className="text-lg font-black text-slate-900">{format(parseISO(shift.start_time), 'h:mm')}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">{format(parseISO(shift.start_time), 'a')}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 border-l border-slate-100 pl-4 py-1">
                                    <h3 className="font-bold text-slate-900 text-base">Training Session</h3>
                                    {shift.locations?.name && (
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
                                            <MapPin className="w-3.5 h-3.5" /> {shift.locations.name}
                                        </div>
                                    )}
                                </div>

                                {/* Action / Status Badge */}
                                <div className="pr-2">
                                    {shift.status === 'completed' ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    ) : shift.status === 'in_progress' ? (
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                            <Clock className="w-5 h-5 animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sync Prompt */}
            <div className="text-center pt-8 opacity-50">
                <p className="text-xs text-slate-400">Everything looks up to date.</p>
            </div>
        </div>
    );
};

export default CoachSchedule;
