import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { format, isToday } from 'date-fns';

const CoachScheduleWidget = () => {
    const { user } = useAuthStore();
    const [todayShifts, setTodayShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTodayShifts = async () => {
            if (!user) return;
            try {
                const today = new Date().toISOString().split('T')[0];

                // Fetch shifts for today
                const { data, error } = await supabase
                    .from('staff_shifts')
                    .select(`
                        id, 
                        start_time, 
                        end_time,
                        locations ( name, color )
                    `)
                    .eq('staff_id', user.id)
                    .gte('start_time', `${today}T00:00:00`)
                    .lte('start_time', `${today}T23:59:59`)
                    .order('start_time', { ascending: true });

                if (error) throw error;
                setTodayShifts(data || []);
            } catch (err) {
                console.error("Error fetching coach shifts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTodayShifts();
    }, [user]);

    if (loading) return <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                    Today's Schedule
                </h2>
                <Link to="/workspace/schedule" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                    View Full
                </Link>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {todayShifts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-sm font-medium">No sessions scheduled for today.</p>
                        <p className="text-xs mt-1">Enjoy your day off, Coach! 🏝️</p>
                    </div>
                ) : (
                    todayShifts.map(shift => (
                        <div key={shift.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition group">
                            <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center shrink-0">
                                <span className="text-xs font-bold">{format(new Date(shift.start_time), 'HH:mm')}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Training Session</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(shift.end_time), 'HH:mm')}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin className="w-3 h-3" />
                                        {shift.locations?.name || 'Main Gym'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CoachScheduleWidget;
