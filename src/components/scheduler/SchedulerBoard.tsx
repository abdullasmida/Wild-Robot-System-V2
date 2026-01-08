import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useSensor,
    useSensors,
    PointerSensor,
    DragEndEvent,
    DragStartEvent,
    pointerWithin,
    useDroppable
} from '@dnd-kit/core';
import {
    addDays,
    startOfWeek,
    format,
    isSameDay,
    differenceInMinutes,
    startOfDay,
    setHours,
    addWeeks,
    subWeeks
} from 'date-fns';
import { SessionCapsule } from './SessionCapsule';
import { fetchWeekSessions, Session, COACHES, Profile } from './mockData';
import UserAvatar from '../ui/UserAvatar';
import SchedulerSidebar from './SchedulerSidebar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ScheduleControlBar } from './ScheduleControlBar';
import { useScheduleData } from '../../hooks/useScheduleData';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}



export const SchedulerBoard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'day' | 'week'>('day');
    const [selectedBranchId, setSelectedBranchId] = useState('all');
    const [userAcademyId, setUserAcademyId] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // Auth & Init
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.academy_id) {
                const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.id).single();
                if (profile) setUserAcademyId(profile.academy_id);
            } else {
                const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user?.id).single();
                if (profile) setUserAcademyId(profile.academy_id);
            }
        };
        init();
    }, []);

    // Hooks
    const scheduleData = useScheduleData(currentDate, userAcademyId);

    // Legacy Mock fallback (until DB is full)
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    // Fetch Sessions
    // Data derived directly from the hook
    const sessions = (scheduleData.shifts || []).map(s => ({
        ...s,
        coach: s.staff // Map 'staff' relation to 'coach' prop expected by UI
    }));

    // Legacy support for sidebar props if needed, but sidebar should now likely use its own hook or props
    const staffList = scheduleData.coaches || [];

    // Handlers
    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const { error } = await supabase
                .from('staff_shifts')
                .update({ status: 'published' })
                .eq('academy_id', userAcademyId)
                .eq('status', 'draft');

            if (error) throw error;

            toast.success("Schedule Published!", {
                description: `${scheduleData.publishStatus.draftCount} shifts are now visible to staff.`
            });
            scheduleData.refresh(); // Refresh hook data
        } catch (e) {
            toast.error("Failed to publish schedule");
            console.error(e);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date());
        } else if (direction === 'prev') {
            setCurrentDate(prev => view === 'week' ? subWeeks(prev, 1) : addDays(prev, -1));
        } else {
            setCurrentDate(prev => view === 'week' ? addWeeks(prev, 1) : addDays(prev, 1));
        }
    };


    // Time Config
    const START_HOUR = 8; // 8 AM
    const HOURS_COUNT = 14; // Until 10 PM
    const PIXELS_PER_HOUR = 120; // Width of one hour column
    const timelineWidth = HOURS_COUNT * PIXELS_PER_HOUR;

    const hours = Array.from({ length: HOURS_COUNT }, (_, i) => START_HOUR + i);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Current selected day for the main view (Legacy Logic adaptation)
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const activeDay = view === 'week' ? currentDate : currentDate; // Simplified for now

    // DND Handlers
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // Helper: Calculate Shift Cost
    const calculateShiftCost = (staff: Profile, sessionDurationMinutes: number, currentDailyMinutes: number = 0) => {
        if (staff.employmentType === 'part_time') {
            const cost = (sessionDurationMinutes / 60) * (staff.hourlyRate || 0);
            return { cost, status: 'Standard' };
        }

        if (staff.employmentType === 'full_time') {
            const dailyLimitMinutes = (staff.dailyHoursLimit || 9) * 60;
            // distinct: pre-shift total vs post-shift total
            if (currentDailyMinutes > dailyLimitMinutes) {
                return { cost: 0, status: 'Overtime' }; // Entire shift is overtime (simplified)
            }
            if (currentDailyMinutes + sessionDurationMinutes > dailyLimitMinutes) {
                return { cost: 0, status: 'Partial Overtime' };
            }
            return { cost: 0, status: 'Standard' };
        }

        return { cost: 0, status: 'Unknown' };
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        // Debugging
        console.log('DROPPED OVER:', over?.id);

        if (over && active.data.current?.type === 'coach') {
            const coach = active.data.current.coach;

            // Scenario 1: Dropped on an existing session (Swap/Replace)
            // (To be implemented if needed, current ID format session-xxxx)

            // Scenario 2: Dropped on a Grid Cell (New Shift)
            if (String(over.id).startsWith('cell|')) {
                const [_, locationId, isoTime] = String(over.id).split('|');

                console.log(`Creating shift for ${coach.full_name || coach.first_name} at ${locationId} @ ${isoTime}`);

                // 1. Calculate Shift Times
                const startTime = new Date(isoTime);
                const endTime = setHours(startTime, startTime.getHours() + 4); // Default 4 hour shift? Or 1? Let's do 1 for precision.
                // Reset end time minutes? default 1 hour capsule
                endTime.setMinutes(startTime.getMinutes() + 60);

                // 2. Insert into DB
                try {
                    const { error } = await supabase.from('staff_shifts').insert({
                        academy_id: userAcademyId,
                        staff_id: coach.id, // Ensure this maps to profile_id in DB
                        location_id: locationId,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        status: 'draft',
                        cost_estimate: (coach.hourly_rate || 0) * 1 // 1 hour default
                    });

                    if (error) throw error;

                    toast.success("Draft Shift Created");
                    scheduleData.refresh(); // Reload data

                } catch (e) {
                    console.error("Drop create failed:", e);
                    toast.error("Failed to create shift");
                }
            }
        }
    };

    // Filter sessions for current view (Active Day)
    const daySessions = sessions.filter(s => isSameDay(new Date(s.start_time), activeDay));

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin} // Improved collision for grid
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full bg-slate-50 text-slate-900 overflow-hidden font-sans">

                {/* Sidebar: Coaches & Tools */}
                <SchedulerSidebar academyId={userAcademyId} staffList={staffList} />

                {/* Main Board */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50">

                    {/* NEW: Control Bar */}
                    <ScheduleControlBar
                        branches={scheduleData.branches}
                        selectedBranchId={selectedBranchId}
                        stats={scheduleData.stats}
                        publishStatus={scheduleData.publishStatus}
                        onBranchChange={setSelectedBranchId}
                        onPublish={handlePublish}
                        onViewChange={setView}
                        onDateChange={handleDateChange}
                        currentView={view}
                        currentDate={currentDate}
                        isPublishing={isPublishing}
                    />

                    {/* Week Strip (Day View Context) */}
                    <div className="h-14 border-b border-slate-200 flex items-center px-6 bg-white shadow-sm z-10">
                        <div className="flex items-center gap-2">
                            {weekDays.map((day, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentDate(day)} // Jump to that day
                                    className={cn(
                                        "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs transition-all",
                                        isSameDay(day, currentDate)
                                            ? "bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200"
                                            : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                                    )}
                                >
                                    <span>{format(day, 'E')}</span>
                                    <span>{format(day, 'd')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Grid */}
                    <div className="flex-1 overflow-auto relative bg-slate-50/50">
                        <div className="min-w-max pb-20">

                            {/* Time Header */}
                            <div className="sticky top-0 z-20 flex bg-white border-b border-slate-200 h-12 shadow-sm">
                                <div className="w-40 sticky left-0 z-30 bg-white border-r border-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                    LOCATION
                                </div>
                                {hours.map(hour => (
                                    <div key={hour} style={{ width: PIXELS_PER_HOUR }} className="flex-shrink-0 border-r border-slate-100 flex items-center justify-start px-2 text-xs text-slate-400 font-mono">
                                        {format(setHours(new Date(), hour), 'h a')}
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            <div className="relative">
                                {/* Background Grid Lines */}
                                <div className="absolute inset-0 flex pl-40 pointer-events-none z-0">
                                    {hours.map(hour => (
                                        <div key={hour} style={{ width: PIXELS_PER_HOUR }} className="border-r border-slate-200/60 h-full" />
                                    ))}
                                </div>

                                {scheduleData.branches.map(location => (
                                    <div key={location.id} className="flex h-32 border-b border-slate-200 relative group hover:bg-white transition-colors">
                                        {/* Row Header */}
                                        <div className="w-40 sticky left-0 z-10 bg-slate-50/90 border-r border-slate-200 flex flex-col justify-center px-4 backdrop-blur-sm group-hover:bg-white/95 transition-colors shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                            <span className="font-bold text-slate-700">{location.name}</span>
                                            <span className="text-xs text-slate-400">Cap: {(location as any).capacity || '-'}</span>
                                        </div>

                                        {/* Interactive Grid & Sessions */}
                                        <div className="flex-1 relative h-full">

                                            {/* DROPPABLE ZONES LAYER */}
                                            <div className="absolute inset-0 flex h-full">
                                                {hours.map(hour => (
                                                    <DroppableCell
                                                        key={`${location.id}-${hour}`}
                                                        id={`cell|${location.id}|${setHours(activeDay, hour).toISOString()}`}
                                                        width={PIXELS_PER_HOUR}
                                                    />
                                                ))}
                                            </div>

                                            {/* SESSIONS LAYER */}
                                            {daySessions
                                                .filter(s => s.location_id === location.id)
                                                .map(session => {
                                                    const start = new Date(session.start_time);
                                                    const end = new Date(session.end_time);

                                                    // Calculate Position
                                                    const startMin = start.getHours() * 60 + start.getMinutes();
                                                    const dayStartMin = START_HOUR * 60;
                                                    const offsetMinutes = startMin - dayStartMin;
                                                    const durationMinutes = differenceInMinutes(end, start);

                                                    const left = (offsetMinutes / 60) * PIXELS_PER_HOUR;
                                                    const width = (durationMinutes / 60) * PIXELS_PER_HOUR;

                                                    return (
                                                        <SessionCapsule
                                                            key={session.id}
                                                            session={session}
                                                            style={{
                                                                position: 'absolute',
                                                                left: `${left}px`,
                                                                width: `${width - 4}px`, // Slight gap
                                                                top: '8px',
                                                                bottom: '8px',
                                                                zIndex: 10
                                                            }}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeDragItem?.type === 'coach' ? (
                    <div className="bg-white p-3 rounded-lg shadow-2xl border border-emerald-500 w-64 opacity-95 cursor-grabbing flex items-center gap-3 ring-4 ring-emerald-500/10">
                        <img src={activeDragItem.coach.avatar_url} className="w-10 h-10 rounded-full" />
                        <span className="font-bold text-slate-900">{activeDragItem.coach.full_name}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

// --- HELPER COMPONENTS ---

const DroppableCell = ({ id, width }: { id: string, width: number }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{ width }}
            className={cn(
                "h-full border-r border-transparent transition-colors",
                isOver ? "bg-emerald-500/10 border-emerald-500/30" : "hover:bg-slate-50/50"
            )}
        />
    );
};
