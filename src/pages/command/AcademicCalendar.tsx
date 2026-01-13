import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { ClassSession, Program, Profile } from '@/types/custom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isWithinInterval, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, MapPin, User, Tag } from 'lucide-react';
import { toast } from 'sonner';
import CreateBatchModal from '@/components/calendar/CreateBatchModal';
import SessionDetailsDrawer from '@/components/calendar/SessionDetailsDrawer';

export default function AcademicCalendar() {
    const { profile } = useUser();
    const [viewDate, setViewDate] = useState(new Date());
    const [sessions, setSessions] = useState<ClassSession[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);

    // Filters Data
    const [programs, setPrograms] = useState<Program[]>([]);
    const [coaches, setCoaches] = useState<Profile[]>([]);
    const [locations, setLocations] = useState<any[]>([]);

    // Selected Filters
    const [selectedProgram, setSelectedProgram] = useState<string>('all');
    const [selectedCoach, setSelectedCoach] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    useEffect(() => {
        if (profile?.academy_id) {
            fetchFilters();
        }
    }, [profile]);

    useEffect(() => {
        if (profile?.academy_id) {
            fetchSessions();
        }
    }, [profile, viewDate]);

    const fetchFilters = async () => {
        if (!profile?.academy_id) return;
        const { data: progData } = await supabase.from('programs').select('*').eq('academy_id', profile.academy_id);
        const { data: coachData } = await supabase.from('profiles').select('*').eq('academy_id', profile.academy_id).in('role', ['coach', 'head_coach']);
        const { data: locData } = await supabase.from('locations').select('*').eq('academy_id', profile.academy_id);

        if (progData) setPrograms(progData as Program[]);
        if (coachData) setCoaches(coachData as Profile[]);
        if (locData) setLocations(locData);
    };

    const fetchSessions = async () => {
        if (!profile?.academy_id) return;
        setLoading(true);

        const start = startOfWeek(viewDate, { weekStartsOn: 1 }).toISOString(); // Monday start
        const end = endOfWeek(viewDate, { weekStartsOn: 1 }).toISOString();

        try {
            const { data, error } = await supabase
                .from('class_sessions')
                .select(`
                    *,
                    batch:batches (
                        id, name, capacity, min_capacity_for_profit,
                        program:programs ( id, name, color ),
                        location:locations ( id, name )
                    ),
                    coach:profiles ( id, first_name, last_name )
                `)
                .eq('academy_id', profile.academy_id)
                .gte('date', start)
                .lte('date', end);

            if (error) throw error;

            const typedSessions = (data as unknown as ClassSession[]) || [];

            // Note: DB "enrollments" count is not yet linked in this query. 
            // We default to 0 for now until the "session_stats" view is created.
            const sessionsWithMeta = typedSessions.map(s => ({
                ...s,
                enrollment_count: 0 // Placeholder until Phase 3
            }));

            setSessions(sessionsWithMeta);
        } catch (err) {
            console.error('Error fetching calendar:', err);
            console.warn('Failed to load classes silently');
            // toast.error('Failed to load classes'); // Suppressed to avoid global spam
        } finally {
            setLoading(false);
        }
    };

    // --- OVERLAP & VISUAL LAYOUT ALGORITHM ---
    const getVisualProps = (daySessions: ClassSession[]) => {
        // 1. Sort by start time
        const sorted = [...daySessions].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        // 2. Assign positions
        const eventsWithStyle = sorted.map(event => {
            const start = new Date(event.start_time);
            const end = new Date(event.end_time);

            // Find overlaps
            const overlaps = sorted.filter(other => {
                if (other.id === event.id) return false;
                const oStart = new Date(other.start_time);
                const oEnd = new Date(other.end_time);
                return isWithinInterval(start, { start: oStart, end: oEnd }) ||
                    isWithinInterval(oStart, { start: start, end: end });
            });

            // If overlapping, width = 100 / (overlapCount + 1)%
            const totalconcurrent = overlaps.length + 1;
            // Ideally we use ID sorting to be deterministic
            const allInCluster = [event, ...overlaps].sort((a, b) => a.id.localeCompare(b.id));
            const myIndex = allInCluster.findIndex(e => e.id === event.id);

            const widthPercent = 100 / totalconcurrent;
            const leftPercent = myIndex * widthPercent;

            // Type assertion for UI logic
            return {
                ...event,
                visual: {
                    width: `${widthPercent}%`,
                    left: `${leftPercent}%`
                }
            };
        });

        return eventsWithStyle;
    };


    // --- FILTER & GRID LOGIC ---
    const filteredSessions = useMemo(() => {
        return sessions.filter(s => {
            if (selectedProgram !== 'all' && s.batch?.program?.id !== selectedProgram) return false;
            if (selectedCoach !== 'all' && s.coach?.id !== selectedCoach) return false;
            if (selectedLocation !== 'all' && s.batch?.location?.id !== selectedLocation) return false;
            return true;
        });
    }, [sessions, selectedProgram, selectedCoach, selectedLocation]);

    // Grid Settings
    const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(viewDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const startHour = 8;
    const endHour = 21;
    const timeSlots = [];
    for (let i = startHour; i <= endHour; i++) {
        timeSlots.push(i);
    }

    // --- PROFIT RADAR ---
    const getProfitColor = (current: number, min: number) => {
        if (current >= min) return 'bg-emerald-500';
        if (current >= min * 0.7) return 'bg-amber-400';
        return 'bg-rose-500'; // Default to red if empty
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* 1. Header & Filters */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-20 shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Academic Calendar</h1>
                            <p className="text-xs text-slate-500 font-medium">Manage classes, batches, and capacity</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 rounded-lg p-1 items-center gap-1">
                            <button onClick={() => setViewDate(subWeeks(viewDate, 1))} className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="px-3 text-sm font-semibold text-slate-700 w-32 text-center">
                                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                            </span>
                            <button onClick={() => setViewDate(addWeeks(viewDate, 1))} className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        {['owner', 'admin', 'manager'].includes(profile?.role || '') && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Create Batch
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm min-w-[140px]">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            className="text-sm font-medium text-slate-700 bg-transparent outline-none w-full cursor-pointer"
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                        >
                            <option value="all">All Programs</option>
                            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm min-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            className="text-sm font-medium text-slate-700 bg-transparent outline-none w-full cursor-pointer"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            <option value="all">All Locations</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm min-w-[140px]">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            className="text-sm font-medium text-slate-700 bg-transparent outline-none w-full cursor-pointer"
                            value={selectedCoach}
                            onChange={(e) => setSelectedCoach(e.target.value)}
                        >
                            <option value="all">All Coaches</option>
                            {coaches.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. High Density TimeGrid (Detailed Week View) */}
            <div className="flex-1 overflow-auto relative flex" style={{ minHeight: '600px' }}>
                {/* Time Column */}
                <div className="w-14 shrink-0 bg-slate-50 border-r border-slate-200 sticky left-0 z-10 pt-10">
                    {timeSlots.map(hour => (
                        <div key={hour} className="h-20 text-[10px] text-slate-400 font-medium text-right pr-2 -mt-2.5">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                <div className="flex-1 min-w-[800px] grid grid-cols-7 divide-x divide-slate-200 bg-white">
                    {weekDays.map(day => {
                        // Get sessions for this day
                        const daysRawSessions = filteredSessions.filter(s => isSameDay(new Date(s.start_time), day));
                        // CALCULATE LAYOUT
                        const daySessions = getVisualProps(daysRawSessions);

                        return (
                            <div key={day.toString()} className="relative min-w-0">
                                {/* Day Header */}
                                <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 h-10 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{format(day, 'EEE')}</span>
                                    <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-slate-700'}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Grid Lines */}
                                <div className="absolute inset-0 top-10 pointer-events-none">
                                    {timeSlots.map(hour => (
                                        <div key={hour} className="h-20 border-b border-slate-100" />
                                    ))}
                                </div>

                                {/* Events Container */}
                                <div className="relative h-[1120px] mt-0">
                                    {daySessions.map((session: any) => {
                                        // Calc Vertical Position
                                        const start = new Date(session.start_time);
                                        const end = new Date(session.end_time);
                                        const startMin = (start.getHours() * 60) + start.getMinutes();
                                        const endMin = (end.getHours() * 60) + end.getMinutes();

                                        const gridStartMin = startHour * 60; // 8:00 AM = 480
                                        const top = ((startMin - gridStartMin) / 60) * 80; // 80px per hour
                                        const height = ((endMin - startMin) / 60) * 80;

                                        // Styling
                                        const color = session.batch?.program?.color || '#3b82f6';

                                        // Enrollment Logic
                                        const enrollment = session.enrollment_count ?? 0;
                                        const capacity = session.batch?.capacity || '?';
                                        const minProfit = session.batch?.min_capacity_for_profit || 4;

                                        // Visual Layout Props
                                        const { width, left } = session.visual || { width: '100%', left: '0%' };

                                        return (
                                            <div
                                                key={session.id}
                                                onClick={() => setSelectedSession(session)}
                                                className="absolute rounded-md border border-white/40 shadow-sm p-1.5 overflow-hidden cursor-pointer hover:brightness-95 hover:z-50 hover:shadow-lg transition-all group hover:scale-[1.02] origin-left"
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${Math.max(height, 40)}px`,
                                                    left: left,
                                                    width: width,
                                                    backgroundColor: `${color}15`, // 15% opacity
                                                    borderLeft: `3px solid ${color}`,
                                                    maxWidth: '100%' // Ensure no overflow
                                                }}
                                                title={`${session.batch?.name} (${enrollment}/${capacity})`}
                                            >
                                                {/* Header: Time + Profit Radar */}
                                                <div className="flex justify-between items-start leading-none mb-0.5">
                                                    <span className="text-[9px] font-bold text-slate-600 opacity-70">
                                                        {format(start, 'HH:mm')}
                                                    </span>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getProfitColor(enrollment, minProfit)}`} />
                                                </div>

                                                {/* Body: Name */}
                                                <div className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                                                    {session.batch?.name}
                                                </div>

                                                {/* Footer: Coach/Loc */}
                                                <div className="text-[9px] text-slate-500 mt-0.5 flex flex-col gap-0 opacity-80 leading-tight">
                                                    <span className="truncate">{session.coach?.first_name}</span>
                                                    <span className="truncate text-slate-400">{session.batch?.location?.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* A. Create Modal */}
            <CreateBatchModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => fetchSessions()}
            />

            {/* B. Details Drawer */}
            <SessionDetailsDrawer
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
                session={selectedSession}
            />
        </div>
    );
}
