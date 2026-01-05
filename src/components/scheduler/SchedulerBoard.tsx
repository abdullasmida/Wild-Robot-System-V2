import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useSensor,
    useSensors,
    PointerSensor,
    DragEndEvent,
    DragStartEvent
} from '@dnd-kit/core';
import {
    addDays,
    startOfWeek,
    format,
    isSameDay,
    differenceInMinutes,
    startOfDay,
    setHours
} from 'date-fns';
import { SessionCapsule } from './SessionCapsule';
import { fetchWeekSessions, Session, COACHES, LOCATIONS, Profile } from './mockData';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Draggable Coach Item for Sidebar (Light Mode)
const DraggableCoach = ({ coach }: { coach: Profile }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `coach-${coach.id}`,
        data: { type: 'coach', coach },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 border",
                // Card Styling (Light)
                "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50",
                // Dragging State
                isDragging ? "opacity-40 scale-105 border-emerald-500 shadow-xl z-50 ring-2 ring-emerald-500/20" : "hover:-translate-y-0.5"
            )}
        >
            <div className="relative">
                <img src={coach.avatar_url} alt={coach.full_name} className="w-10 h-10 rounded-full border-2 border-slate-100 group-hover:border-slate-200 transition-colors object-cover" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-sm border border-white">
                    LVL
                </div>
            </div>
            <div>
                <p className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{coach.full_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <p className="text-[10px] text-slate-500 group-hover:text-slate-700 uppercase tracking-wider font-medium">{coach.role}</p>
                </div>
            </div>

            {/* Grab Handle Icon */}
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-4 border-r-2 border-l-2 border-slate-300 h-3"></div>
            </div>
        </div>
    );
};

export const SchedulerBoard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    // Load Data
    useEffect(() => {
        fetchWeekSessions().then(setSessions);
    }, []);

    // Time Config
    const START_HOUR = 8; // 8 AM
    const HOURS_COUNT = 14; // Until 10 PM
    const PIXELS_PER_HOUR = 120; // Width of one hour column
    const timelineWidth = HOURS_COUNT * PIXELS_PER_HOUR;

    const hours = Array.from({ length: HOURS_COUNT }, (_, i) => START_HOUR + i);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Current selected day for the main view
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const activeDay = weekDays[selectedDayIndex];

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (over && active.data.current?.type === 'coach') {
            const coach = active.data.current.coach;
            const sessionId = over.id;

            // Optimistic Update
            setSessions(prev => prev.map(s => {
                if (s.id === sessionId) {
                    return { ...s, coach_id: coach.id, coach: coach, wibo_conflict_flag: false }; // Clear conflict on manual fix?
                }
                return s;
            }));

            // Calculate impact (Visual Feedback Logic)
            // In a real app, we'd calculate the day's total minutes for this coach first
            const duration = 60; // Mock duration
            const result = calculateShiftCost(coach, duration, 0);
            console.log(`Assigned ${coach.full_name} to session ${sessionId}. Cost: ${result.cost}, Status: ${result.status}`);
        }
    };

    // Filter sessions for current view (Active Day)
    const daySessions = sessions.filter(s => isSameDay(new Date(s.start_time), activeDay));

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-full bg-slate-50 text-slate-900 overflow-hidden font-sans">

                {/* Sidebar: Coaches & Tools */}
                <aside className="w-80 border-r border-slate-200 flex flex-col bg-white">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                            <CalendarIcon className="text-emerald-600" />
                            Wibo Scheduler
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Drag coaches to assign sessions.</p>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Available Staff</h3>
                        {COACHES.map(coach => (
                            <DraggableCoach key={coach.id} coach={coach} />
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-white">
                        <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300">
                            Auto-Schedule with Wibo AI
                        </button>
                    </div>
                </aside>

                {/* Main Board */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50">

                    {/* Top Bar: Navigation */}
                    <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedDayIndex(prev => Math.max(0, prev - 1))}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                                disabled={selectedDayIndex === 0}
                            >
                                <ChevronLeft />
                            </button>
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-slate-800">{format(activeDay, 'EEEE, MMMM do')}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedDayIndex(prev => Math.min(6, prev + 1))}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                                disabled={selectedDayIndex === 6}
                            >
                                <ChevronRight />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {weekDays.map((day, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDayIndex(idx)}
                                    className={cn(
                                        "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs transition-all",
                                        idx === selectedDayIndex
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

                                {LOCATIONS.map(location => (
                                    <div key={location.id} className="flex h-32 border-b border-slate-200 relative group hover:bg-white transition-colors">
                                        {/* Row Header */}
                                        <div className="w-40 sticky left-0 z-10 bg-slate-50/90 border-r border-slate-200 flex flex-col justify-center px-4 backdrop-blur-sm group-hover:bg-white/95 transition-colors shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                            <span className="font-bold text-slate-700">{location.name}</span>
                                            <span className="text-xs text-slate-400">Cap: {location.capacity}</span>
                                        </div>

                                        {/* Sessions Track */}
                                        <div className="flex-1 relative">
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
