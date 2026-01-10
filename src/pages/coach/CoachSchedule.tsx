import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    parseISO,
    isToday,
    startOfDay,
    endOfDay,
    isBefore
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    MapPin,
    Clock,
    Briefcase,
    Calendar,
    Users,
    MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import ShiftDetailsDrawer from '@/components/scheduler/ShiftDetailsDrawer';
import { Session } from '@/types/custom';
import UserAvatar from '@/components/ui/UserAvatar';

const CoachSchedule = () => {
    const { user, profile } = useUser();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewDate, setViewDate] = useState(new Date());

    // Drawer State
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    // Fetch Data
    const fetchSchedule = async () => {
        if (!profile?.academy_id) return;
        setLoading(true);
        try {
            // Calculate Week Range
            const start = startOfWeek(viewDate, { weekStartsOn: 1 }).toISOString();
            const end = addDays(startOfWeek(viewDate, { weekStartsOn: 1 }), 7).toISOString();

            // Fetch Sessions
            const { data, error } = await supabase
                .from('sessions')
                .select(`
                    *,
                    locations ( name, color, address ),
                    assignments:session_assignments (
                        id,
                        status,
                        staff_id,
                        role,
                        staff:profiles ( id, first_name, last_name, avatar_url )
                    )
                `)
                .eq('academy_id', profile.academy_id)
                .eq('is_published', true) // CRITICAL: Only show published shifts to staff
                .gte('start_time', start)
                .lt('start_time', end)
                .order('start_time', { ascending: true });

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }
            // Cast to strictly typed Session array
            setSessions((data as any[]) || []);
        } catch (err: any) {
            console.error("Error loading schedule:", err);
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [profile, viewDate]);

    // Calendar Navigation
    const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Grouping
    const getMyShifts = (day: Date) => {
        return sessions.filter(s =>
            isSameDay(parseISO(s.start_time), day) &&
            s.assignments?.some((a) => a.staff_id === user?.id)
        );
    };

    const getOpenShifts = (day: Date) => {
        return sessions.filter(s =>
            isSameDay(parseISO(s.start_time), day) &&
            s.is_open_for_claim === true &&
            !s.assignments?.some((a) => a.staff_id === user?.id)
        );
    };

    const openDrawer = (session: Session) => {
        setSelectedSession(session);
        setDrawerOpen(true);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overscroll-none font-sans">

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-30 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            My Schedule
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button onClick={() => setViewDate(addDays(viewDate, -7))} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-slate-500 hover:text-slate-800"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setViewDate(new Date())} className="px-4 text-xs font-bold hover:bg-white rounded-md transition-all text-slate-600 hover:text-slate-900">Today</button>
                    <button onClick={() => setViewDate(addDays(viewDate, 7))} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-slate-500 hover:text-slate-800"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            {/* --- MOBILE VIEW (< md) --- */}
            {/* Same as before but polished */}
            <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-6">
                {weekDays.map((day) => {
                    const myShifts = getMyShifts(day);
                    const openShifts = getOpenShifts(day);
                    const isTodayDay = isToday(day);
                    const hasEvents = myShifts.length > 0 || openShifts.length > 0;

                    return (
                        <div key={day.toISOString()} className={`relative pl-4 border-l-2 ${isTodayDay ? 'border-blue-500' : 'border-slate-200'}`}>
                            <div className="mb-3 flex items-baseline gap-2">
                                <span className={`text-lg font-black ${isTodayDay ? 'text-blue-600' : 'text-slate-900'}`}>{format(day, 'EEEE')}</span>
                                <span className="text-sm font-medium text-slate-400">{format(day, 'MMM d')}</span>
                            </div>

                            {!hasEvents && (
                                <div className="text-xs text-slate-400 italic mb-2">No shifts scheduled</div>
                            )}

                            <div className="space-y-3">
                                {/* OPEN SHIFTS */}
                                {openShifts.map(session => (
                                    <ShiftCardMobile key={session.id} session={session} onClick={() => openDrawer(session)} type="open" />
                                ))}
                                {/* MY SHIFTS */}
                                {myShifts.map(session => (
                                    <ShiftCardMobile key={session.id} session={session} onClick={() => openDrawer(session)} type="assigned" />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- DESKTOP VIEW (>= md): 7-Col Grid --- */}
            <div className="hidden md:flex flex-1 overflow-hidden">
                <div className="flex-1 grid grid-cols-7 h-full divide-x divide-slate-200">
                    {weekDays.map((day) => {
                        const myShifts = getMyShifts(day);
                        const openShifts = getOpenShifts(day);
                        const isTodayDay = isToday(day);

                        return (
                            <div key={day.toISOString()} className={`flex flex-col h-full bg-slate-50 relative group ${isTodayDay ? 'bg-blue-50/30' : ''}`}>

                                {/* Header */}
                                <div className={`px-2 py-3 text-center border-b border-slate-200 ${isTodayDay ? 'bg-blue-600 text-white shadow-md z-10' : 'bg-white'}`}>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isTodayDay ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {format(day, 'EEE')}
                                    </div>
                                    <div className={`text-xl font-black ${isTodayDay ? 'text-white' : 'text-slate-700'}`}>
                                        {format(day, 'd')}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">

                                    {/* Open Shifts Zone */}
                                    {openShifts.length > 0 && (
                                        <div className="bg-emerald-50/50 rounded-lg p-1.5 border border-emerald-100/50 space-y-2 mb-2">
                                            <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider text-center py-1">Open Shifts</div>
                                            {openShifts.map(session => (
                                                <ShiftCard key={session.id} session={session} onClick={() => openDrawer(session)} type="open" />
                                            ))}
                                        </div>
                                    )}

                                    {/* My Shifts Zone */}
                                    {myShifts.map(session => (
                                        <ShiftCard key={session.id} session={session} onClick={() => openDrawer(session)} type="assigned" />
                                    ))}

                                    {/* Empty State Pattern */}
                                    {!openShifts.length && !myShifts.length && (
                                        <div className="h-full w-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] pointer-events-none" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ShiftDetailsDrawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                session={selectedSession}
                onActionComplete={fetchSchedule}
            />

            {/* DEBUGGING AID (Temporary) - Remove after fixing */}
            <div className="p-4 bg-slate-900 text-slate-400 text-xs font-mono m-4 rounded-lg overflow-auto max-h-64">
                <p className="font-bold text-white mb-2">🔍 DEBUGGER</p>
                <p>User ID: {user?.id}</p>
                <p>Academy ID: {profile?.academy_id}</p>
                <p>Raw Sessions Fetched: {sessions.length}</p>
                {sessions.length > 0 && (
                    <div className="mt-2 border-t border-slate-700 pt-2">
                        <p>First Session Sample:</p>
                        <p>ID: {sessions[0].id}</p>
                        <p>Is Published: {String(sessions[0].is_published)}</p>
                        <p>Assignments Count: {sessions[0].assignments?.length}</p>
                        {sessions[0].assignments?.length ? (
                            <p>Assigned Staff ID: {sessions[0].assignments[0].staff_id}</p>
                        ) : <p>No Assignments</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const ShiftCard = ({ session, onClick, type }: { session: Session, onClick: () => void, type: 'open' | 'assigned' }) => {
    const startTime = parseISO(session.start_time);
    const endTime = parseISO(session.end_time);

    // Dynamic border color
    const borderColor = type === 'open' ? '#10b981' : (session.locations?.color || '#3b82f6');
    const bgColor = type === 'open' ? 'bg-white' : 'bg-white';

    return (
        <div
            onClick={onClick}
            className={`
                relative rounded-lg shadow-sm border border-slate-200 
                cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                group overflow-hidden ${bgColor}
            `}
        >
            {/* Color Strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: borderColor }} />

            <div className="pl-3 p-2.5">
                {/* Header: Time */}
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">
                        {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                    </span>
                    {type === 'open' && (
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    )}
                </div>

                {/* Body: Title & Location */}
                <div className="mb-2">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight truncate pr-2">
                        {session.title || session.job_type}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium truncate">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {session.locations?.name || 'Remote'}
                    </div>
                </div>

                {/* Footer: Crew Avatars */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {type === 'open' ? 'Claim' : 'Crew'}
                    </span>
                    <div className="flex -space-x-1.5">
                        {session.assignments?.slice(0, 3).map((a: any) => (
                            <div key={a.id} className="w-5 h-5 rounded-full ring-1 ring-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                <UserAvatar user={a.staff} className="w-full h-full text-[8px]" />
                            </div>
                        ))}
                        {(session.assignments?.length || 0) > 3 && (
                            <div className="w-5 h-5 rounded-full ring-1 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                +
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const ShiftCardMobile = ({ session, onClick, type }: { session: Session, onClick: () => void, type: 'open' | 'assigned' }) => {
    const startTime = parseISO(session.start_time);
    const endTime = parseISO(session.end_time);
    const borderColor = type === 'open' ? '#10b981' : (session.locations?.color || '#3b82f6');

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-slate-100 relative overflow-hidden active:scale-95 transition-transform flex"
        >
            <div className="w-1.5 bg-slate-200" style={{ backgroundColor: borderColor }} />
            <div className="p-3 flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{session.title || session.job_type}</h3>
                    {type === 'open' && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 rounded">OPEN</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono"><Clock className="w-3.5 h-3.5" /> {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.locations?.name || 'Remote'}</span>
                </div>
            </div>
        </div>
    )
}

export default CoachSchedule;
