import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    parseISO,
    isSameMonth
} from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight, X, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const CoachSchedule = () => {
    const { user } = useUser();
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modals
    const [selectedShift, setSelectedShift] = useState<any | null>(null);

    // Fetch Data
    useEffect(() => {
        let mounted = true;
        const fetchShifts = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch shifts with Location Details (Name, Color, Address)
                const { data, error } = await supabase
                    .from('staff_shifts')
                    .select(`
                        id,
                        start_time,
                        end_time,
                        status,
                        cost_estimate,
                        location_id,
                        locations ( name, address, color )
                    `)
                    .eq('staff_id', user.id)
                    .order('start_time', { ascending: true });

                if (error) throw error;
                if (mounted) setShifts(data || []);
            } catch (err) {
                console.error("Error loading schedule:", err);
                toast.error("Failed to load schedule.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchShifts();
        return () => { mounted = false; };
    }, [user]);

    // --- Calendar Logic ---

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getDayShifts = (day: Date) => {
        return shifts.filter(shift => isSameDay(parseISO(shift.start_time), day));
    };

    // Calculate Shift Duration for Display (e.g. "4h")
    const getDurationLabel = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        const hours = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
        return `${hours}h`;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Schedule</h1>
                    <p className="text-slate-500 font-medium">View your assigned shifts and classes.</p>
                </div>

                {/* Date Nav */}
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 font-bold text-slate-800 w-40 text-center select-none">
                        {format(currentDate, 'MMMM yyyy')}
                    </div>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* MONTH CALENDAR GRID */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] divide-x divide-slate-100/50">
                    {calendarDays.map((day, idx) => {
                        const dayShifts = getDayShifts(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        // If NOT current month, grey out background
                        const bgClass = !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white';

                        return (
                            <div
                                key={day.toISOString()}
                                className={`relative p-2 border-b border-slate-100 ${bgClass} group transition-colors hover:bg-slate-50`}
                            >
                                {/* Date Number */}
                                <div className="flex justify-between items-start mb-2">
                                    <span
                                        className={`
                                            text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                            ${isTodayDate ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}
                                            ${!isCurrentMonth ? 'opacity-50' : ''}
                                        `}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Shift Capsules */}
                                <div className="space-y-1.5">
                                    {dayShifts.map(shift => {
                                        const locColor = shift.locations?.color || '#10B981';

                                        return (
                                            <button
                                                key={shift.id}
                                                onClick={() => setSelectedShift(shift)}
                                                className="w-full text-left px-2 py-1.5 rounded-md border text-xs font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-sm truncate flex items-center gap-1.5"
                                                style={{
                                                    backgroundColor: `${locColor}15`, // 15% opacity hex
                                                    borderColor: `${locColor}40`,     // 40% opacity border
                                                    color: '#334155'
                                                }}
                                            >
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: locColor }}
                                                />
                                                <span className="truncate">
                                                    {format(parseISO(shift.start_time), 'HH:mm')}
                                                </span>
                                                <span className="opacity-50 font-medium ml-auto">
                                                    {getDurationLabel(shift.start_time, shift.end_time)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Shift Details Modal (Read Only) */}
            {selectedShift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header with Color Match */}
                        <div
                            className="h-24 relative p-6 flex flex-col justify-end"
                            style={{ backgroundColor: selectedShift.locations?.color || '#10B981' }}
                        >
                            <button
                                onClick={() => setSelectedShift(null)}
                                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <h3 className="text-white font-black text-xl leading-none drop-shadow-sm">
                                {selectedShift.title || 'Training Session'}
                            </h3>
                        </div>

                        <div className="p-6 space-y-6">

                            {/* Time & Pay */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                        <span>
                                            <span>
                                                {(selectedShift.start_time && selectedShift.end_time) ? (
                                                    `${format(parseISO(selectedShift.start_time), 'HH:mm')} - ${format(parseISO(selectedShift.end_time), 'HH:mm')}`
                                                ) : 'Time Not Set'}
                                            </span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {format(parseISO(selectedShift.start_time), 'EEEE, MMMM do')}
                                    </p>
                                </div>
                                <div className="w-px h-10 bg-slate-100" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Pay</p>
                                    <div className="flex items-center gap-1 text-slate-900 font-bold">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        <span>{selectedShift.cost_estimate || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                        {selectedShift.locations?.name || 'Unknown Location'}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                        {selectedShift.locations?.address || 'No address provided'}
                                    </p>
                                </div>
                            </div>

                            {/* Status and Clock In */}
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 rounded-lg border border-slate-200 bg-white text-center">
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</span>
                                    <span className={`
                                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize
                                        ${selectedShift.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                                    `}>
                                        {selectedShift.status === 'completed' ? 'Completed' : 'Upcoming'}
                                    </span>
                                </div>
                                <button
                                    disabled={selectedShift.status === 'completed'}
                                    onClick={() => {
                                        toast.success("Clocked In Successfully! ⏱️");
                                        setSelectedShift(null);
                                    }}
                                    className="flex-1 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    {selectedShift.status === 'completed' ? 'Done' : 'Clock In'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CoachSchedule;
