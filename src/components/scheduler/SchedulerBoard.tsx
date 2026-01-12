import React, { useState, useEffect, useRef } from 'react';
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
    setHours,
    addWeeks,
    subWeeks,
    isToday,
    setMinutes
} from 'date-fns';
import { SessionCapsule } from './SessionCapsule';
import SchedulerSidebar from './SchedulerSidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ScheduleControlBar } from './ScheduleControlBar';
import { useScheduleData } from '../../hooks/useScheduleData';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';
import { Session } from '../../types/custom';
import UserAvatar from '../ui/UserAvatar';
import { QuickCreatePopover } from './QuickCreatePopover';
import { Plus } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const SchedulerBoard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'day' | 'week'>('week'); // Default to week
    const [selectedBranchId, setSelectedBranchId] = useState('all');
    const [userAcademyId, setUserAcademyId] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // Quick Create State (The "Ghost" Logic)
    const [quickDraft, setQuickDraft] = useState<{ date: Date | null }>({ date: null });

    // Auth & Init
    const [academyConfig, setAcademyConfig] = useState<{ enableOpenShifts: boolean }>({ enableOpenShifts: false });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            let academyId = null;

            if (user?.user_metadata?.academy_id) {
                academyId = user.user_metadata.academy_id;
            } else {
                const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user?.id).single();
                academyId = profile?.academy_id;
            }

            if (academyId) {
                setUserAcademyId(academyId);
                // Fetch Academy Config
                const { data: academy } = await supabase
                    .from('academies')
                    .select('config_enable_open_shifts')
                    .eq('id', academyId)
                    .single();

                if (academy) {
                    setAcademyConfig({ enableOpenShifts: academy.config_enable_open_shifts || false });
                }
            }
        };
        init();
    }, []);

    // Hooks
    const scheduleData = useScheduleData(currentDate, userAcademyId);

    // Active Drag State
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    // Fetch Sessions & Map to UI
    const sessions = (scheduleData.shifts || []) as Session[];

    // Helpers
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getSessionsForDay = (date: Date) => {
        return sessions.filter(s => isSameDay(new Date(s.start_time), date))
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    };

    const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date());
        } else if (direction === 'prev') {
            setCurrentDate(prev => addWeeks(prev, -1));
        } else {
            setCurrentDate(prev => addWeeks(prev, 1));
        }
    };

    // --- QUICK CREATE HANDLER ---
    const handleQuickCreateSubmit = async (data: any) => {
        if (!quickDraft.date) return;

        try {
            // Parse Times
            const [startHour, startMin] = data.startTime.split(':').map(Number);
            const [endHour, endMin] = data.endTime.split(':').map(Number);

            const startDateTime = setMinutes(setHours(quickDraft.date, startHour), startMin);
            let endDateTime = setMinutes(setHours(quickDraft.date, endHour), endMin);

            // Handle overnight (if end is before start, assume next day)
            if (endDateTime < startDateTime) {
                endDateTime = addDays(endDateTime, 1);
            }

            // Resolve Branch
            const targetLocationId = data.locationId;
            const locationObj = scheduleData.branches.find(b => b.id === targetLocationId);

            const { error } = await supabase
                .from('sessions')
                .insert({
                    academy_id: userAcademyId,
                    location_id: targetLocationId,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    is_published: false,
                    is_open_for_claim: true,
                    job_type: 'Coach', // Default
                    title: 'Open Shift',
                    capacity: data.quantity,
                    branch: locationObj?.name || 'Main Branch'
                });

            if (error) throw error;

            toast.success("Shift Created! 🚀");
            scheduleData.refresh();
            setQuickDraft({ date: null }); // Close popover

        } catch (e: any) {
            console.error(e);
            toast.error("Failed to create shift");
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const startStr = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
            const endStr = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 7).toISOString();

            const { data, error } = await supabase
                .rpc('publish_weekly_shifts', {
                    p_academy_id: userAcademyId,
                    p_start_date: startStr,
                    p_end_date: endStr
                });

            if (error) throw error;

            toast.success("Schedule Published!", {
                description: `${data} shifts have been notified.`
            });
            scheduleData.refresh();
        } catch (e) {
            toast.error("Failed to publish schedule");
            console.error(e);
        } finally {
            setIsPublishing(false);
        }
    };

    // --- DND HANDLERS ---
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;
        const draggedStaff = active.data.current?.coach;
        if (!draggedStaff) return;

        try {
            // CASE B: Dropped on Session Card -> ASSIGN
            if (String(over.id).startsWith('session|')) {
                const sessionId = String(over.id).split('|')[1];

                const { error } = await supabase.from('session_assignments').insert({
                    session_id: sessionId,
                    staff_id: draggedStaff.id,
                    status: 'confirmed',
                    role: draggedStaff.role || 'Coach'
                });

                if (error) {
                    if (error.code === '23505') { // Duplicate assignment
                        toast.info(`${draggedStaff.first_name} is already assigned to this shift.`);
                        return;
                    }
                    throw error;
                }
                toast.success(`Assigned ${draggedStaff.first_name} to shift`);
                scheduleData.refresh();
            }

            // CASE C: Dropped on "Open Shifts" Header -> CREATE OPEN SHIFT
            else if (String(over.id).startsWith('open|') && academyConfig.enableOpenShifts) {
                const dateStr = String(over.id).split('|')[1];
                const targetDate = new Date(dateStr);
                // We can potentially trigger the new Quick Create Popover here too if we wanted!

                // Existing Logic:
                const startTime = setHours(targetDate, 9);
                const endTime = setHours(targetDate, 13);
                let targetLocationId = selectedBranchId !== 'all' ? selectedBranchId : scheduleData.branches[0]?.id;
                if (!targetLocationId && scheduleData.branches.length > 0) targetLocationId = scheduleData.branches[0].id;

                if (!targetLocationId) {
                    toast.error("No locations found.");
                    return;
                }
                const locationObj = scheduleData.branches.find(b => b.id === targetLocationId);

                const { error } = await supabase
                    .from('sessions')
                    .insert({
                        academy_id: userAcademyId,
                        location_id: targetLocationId,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        is_published: false,
                        is_open_for_claim: true,
                        job_type: draggedStaff.role || 'Any',
                        title: 'Open Shift',
                        capacity: 1,
                        branch: locationObj?.name || 'Main Branch'
                    });

                if (error) throw error;
                toast.success("Created New Open Shift");
                scheduleData.refresh();
            }

            // CASE A: Dropped on Day Column -> CREATE ASSIGNED SHIFT
            else if (String(over.id).startsWith('day|')) {
                const dateStr = String(over.id).split('|')[1];
                const targetDate = new Date(dateStr);

                // Default Time: 09:00 AM - 01:00 PM (4 Hours)
                const startTime = setHours(targetDate, 9);
                const endTime = setHours(targetDate, 13);
                let targetLocationId = selectedBranchId !== 'all' ? selectedBranchId : scheduleData.branches[0]?.id;
                if (!targetLocationId && scheduleData.branches.length > 0) targetLocationId = scheduleData.branches[0].id;

                if (!targetLocationId) {
                    toast.error("No locations found.");
                    return;
                }
                const locationObj = scheduleData.branches.find(b => b.id === targetLocationId);

                const { data: sessionData, error: sessionError } = await supabase
                    .from('sessions')
                    .insert({
                        academy_id: userAcademyId,
                        location_id: targetLocationId,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        is_published: false,
                        job_type: draggedStaff.role || 'Staff',
                        title: `${draggedStaff.first_name}'s Shift`,
                        capacity: 1,
                        branch: locationObj?.name || 'Main Branch'
                    })
                    .select()
                    .single();

                if (sessionError) throw sessionError;

                // Auto-assign the creator
                const { error: assignError } = await supabase
                    .from('session_assignments')
                    .insert({
                        session_id: sessionData.id,
                        staff_id: draggedStaff.id,
                        status: 'confirmed',
                        role: draggedStaff.role
                    });

                if (assignError) throw assignError;

                toast.success("New Draft Shift Created");
                scheduleData.refresh();
            }
        } catch (e: any) {
            console.error("Drag Action Failed:", e);
            toast.error("Action failed", { description: e.message || "Unknown error" });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full bg-slate-50 text-slate-900 overflow-hidden font-sans">

                {/* SIDEBAR */}
                <SchedulerSidebar academyId={userAcademyId} staffList={scheduleData.coaches || []} />

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50">

                    {/* CONTROL BAR */}
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

                    {/* BOARD (7 Columns) */}
                    <div className="flex-1 overflow-hidden relative border-t border-slate-200">
                        <div className="absolute inset-0 flex divide-x divide-slate-200 overflow-x-auto">
                            {weekDays.map((day) => (
                                <DayColumn
                                    key={day.toISOString()}
                                    day={day}
                                    isToday={isToday(day)}
                                    sessions={getSessionsForDay(day)}
                                    // Only allow Quick Draft if Open Shifts are enabled
                                    onDayClick={(d) => academyConfig.enableOpenShifts && setQuickDraft({ date: d })}
                                    quickDraftTarget={quickDraft.date}
                                    onQuickCreate={handleQuickCreateSubmit}
                                    onCloseQuickDraft={() => setQuickDraft({ date: null })}
                                    locations={scheduleData.branches}
                                    enableOpenShifts={academyConfig.enableOpenShifts}
                                />
                            ))}
                        </div>
                    </div>

                </main>
            </div>

            {/* DRAG OVERLAY */}
            <DragOverlay>
                {activeDragItem?.type === 'coach' ? (
                    <div className="bg-white p-3 rounded-lg shadow-2xl border border-emerald-500 w-64 opacity-95 cursor-grabbing flex items-center gap-3 ring-4 ring-emerald-500/10 rotate-3 transform transition-transform">
                        <UserAvatar profile={activeDragItem.coach} size="sm" />
                        <div>
                            <span className="font-bold text-slate-900 block">{activeDragItem.coach.first_name}</span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Assigning...</span>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

// --- SUB-COMPONENTS ---

interface DayColumnProps {
    day: Date;
    isToday: boolean;
    sessions: Session[];
    onDayClick: (date: Date) => void;
    quickDraftTarget: Date | null;
    onQuickCreate: (data: any) => Promise<void>;
    onCloseQuickDraft: () => void;
    locations: any[];
    enableOpenShifts: boolean;
}

const DayColumn = ({
    day,
    isToday,
    sessions,
    onDayClick,
    quickDraftTarget,
    onQuickCreate,
    onCloseQuickDraft,
    locations,
    enableOpenShifts
}: DayColumnProps) => {

    const isQuickDraftActive = quickDraftTarget && isSameDay(day, quickDraftTarget);

    // Drop Zone for the main day (Assigned Shift)
    const { setNodeRef: setDayRef, isOver: isOverDay } = useDroppable({
        id: `day|${day.toISOString()}`,
        data: { type: 'day', day }
    });

    // Drop Zone for Open Shifts - Conditionally Rendered
    const { setNodeRef: setOpenRef, isOver: isOverOpen } = useDroppable({
        id: `open|${day.toISOString()}`,
        data: { type: 'open_header', day },
        disabled: !enableOpenShifts
    });

    return (
        <div
            ref={setDayRef}
            // Add click handler to the background
            onClick={(e) => {
                // Prevent triggering when clicking inner elements
                if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('clickable-area')) {
                    onDayClick(day);
                }
            }}
            className={cn(
                "flex-1 min-w-[220px] flex flex-col h-full transition-colors relative group border-r border-slate-200 outline-none",
                isOverDay ? "bg-blue-50/30" : "bg-slate-50/30 hover:bg-slate-100/30",
                isToday ? "bg-blue-50/10" : ""
            )}
        >
            {/* Header */}
            <div className={cn(
                "p-3 text-center border-b border-slate-200 sticky top-0 z-20 backdrop-blur-sm pointer-events-none", // pointer-events-none to pass click through if needed, but likely we wantheader to be safe
                isToday ? "bg-blue-600 text-white shadow-md shadow-blue-900/10" : "bg-white/95"
            )}>
                <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", isToday ? "text-blue-200" : "text-slate-400")}>
                    {format(day, 'EEE')}
                </div>
                <div className={cn("text-2xl font-black leading-none", isToday ? "text-white" : "text-slate-800")}>
                    {format(day, 'd')}
                </div>
            </div>

            {/* Quick Action Overlay Hint (Only when hovering and not active) */}
            {enableOpenShifts && (
                <div className="absolute top-16 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                        <Plus className="w-4 h-4" />
                    </div>
                </div>
            )}

            {/* Open Shifts Header Zone - CONDITIONAL */}
            {enableOpenShifts && (
                <div
                    ref={setOpenRef}
                    className={cn(
                        "p-2 border-b border-dashed border-slate-300 transition-all flex flex-col items-center justify-center gap-1",
                        isOverOpen
                            ? "bg-emerald-100/80 h-24 border-emerald-400"
                            : "bg-slate-100/50 hover:bg-slate-200/50 min-h-[40px]"
                    )}
                >
                    <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest text-center",
                        isOverOpen ? "text-emerald-700" : "text-slate-400"
                    )}>
                        {isOverOpen ? "Drop to Create Open Shift" : "Open Shifts"}
                    </span>
                </div>
            )}

            {/* Sessions Stack */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 clickable-area cursor-pointer">

                {/* Render Sessions */}
                {sessions.map(session => (
                    <SessionCapsule
                        key={session.id}
                        session={session}
                    />
                ))}

                {/* GHOST CARD + POPOVER */}
                {isQuickDraftActive && enableOpenShifts && (
                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                        {/* THE VISUAL GHOST CARD */}
                        <div className="rounded-xl p-3 mb-2 border-2 border-dashed border-emerald-400 bg-emerald-50/50 opacity-100 min-h-[90px] flex flex-col justify-between">
                            <div className="flex justify-between items-start w-full mb-1">
                                <span className="font-mono font-bold text-emerald-600 tracking-tighter text-[10px]">
                                    09:00 - 13:00
                                </span>
                                <div className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                    Planning...
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight text-slate-900">New Shift</h4>
                                <span className="text-[10px] uppercase tracking-wide text-slate-500">Select Details</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1 bg-white/50 border border-emerald-100">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-slate-500">?</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500 italic">Unassigned</span>
                            </div>
                        </div>

                        {/* THE POPOVER FORM */}
                        <QuickCreatePopover
                            date={day}
                            onClose={onCloseQuickDraft}
                            onCreate={onQuickCreate}
                            onMoreOptions={() => {
                                toast.info("Full modal coming soon!");
                                onCloseQuickDraft();
                            }}
                            locations={locations}
                        />
                    </div>
                )}

                {/* Drop Hint for Day Column */}
                {isOverDay && !isOverOpen && (
                    <div className="h-24 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex items-center justify-center animate-pulse mt-2 transition-all">
                        <span className="text-blue-600 text-xs font-bold">Drop to Assign to {format(day, 'EEEE')}</span>
                    </div>
                )}

                {sessions.length === 0 && !isQuickDraftActive && !isOverDay && !isOverOpen && (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-none">
                        <div className="text-center">
                            <div className="w-1 h-12 bg-slate-200 mx-auto rounded-full mb-2"></div>
                            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">Free Day</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
