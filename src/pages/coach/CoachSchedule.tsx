import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../supabaseClient';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CoachSchedule = () => {
    const { user } = useUser();
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShifts = async () => {
            if (!user) return;

            try {
                // Fetch shifts for the logged-in coach
                // Join with locations to get the name
                const { data, error } = await supabase
                    .from('staff_shifts')
                    .select(`
                        id,
                        start_time,
                        end_time,
                        status,
                        locations (
                            name
                        )
                    `)
                    .eq('staff_id', user.id) // Use staff_id based on schema usually matching auth.uid() or linked profile
                    .gte('start_time', new Date().toISOString()) // Upcoming only? Or all? User said "CoachSchedule Page... read-only version of Scheduler". Usually implies future.
                    // Let's show today and future.
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

    if (loading) {
        return <div className="p-8 text-center text-slate-400 font-medium">Loading Schedule...</div>;
    }

    if (shifts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-200 mt-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Upcoming Shifts</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">You don't have any scheduled shifts coming up. Enjoy your time off!</p>
            </div>
        );
    }

    // Grouping by Date
    const grouped = shifts.reduce((acc, shift) => {
        const dateKey = format(parseISO(shift.start_time), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(shift);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
                    <p className="text-slate-500 font-medium">Upcoming classes and sessions</p>
                </div>
                <button className="text-emerald-600 font-bold text-sm hover:underline">Sync Calendar</button>
            </div>

            <div className="space-y-6">
                {Object.entries(grouped).map(([date, dayShifts]) => {
                    const dateObj = parseISO(date);
                    let title = format(dateObj, 'EEEE, MMMM do');
                    if (isToday(dateObj)) title = 'Today';
                    if (isTomorrow(dateObj)) title = 'Tomorrow';

                    return (
                        <div key={date}>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{title}</h2>
                            <div className="space-y-3">
                                {dayShifts.map(shift => (
                                    <div key={shift.id} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex items-start gap-4 cursor-default">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                                            <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-500 uppercase">{format(parseISO(shift.start_time), 'a')}</span>
                                            <span className="text-lg font-black text-slate-900 group-hover:text-emerald-700">{format(parseISO(shift.start_time), 'h:mm')}</span>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                                {/* If we had class title, use it. Else Generic. */}
                                                Shift Session
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {format(parseISO(shift.start_time), 'h:mm')} - {format(parseISO(shift.end_time), 'h:mm a')}
                                                </div>
                                                {shift.locations?.name && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {shift.locations.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {shift.status === 'in_progress' && (
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md">Live</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-8 text-center">
                <p className="text-xs text-slate-400">Showing upcoming shifts only. <Link to="/coach/history" className="underline hover:text-slate-600">View History</Link></p>
            </div>
        </div>
    );
};

export default CoachSchedule;
