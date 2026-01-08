import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import UserAvatar from '../ui/UserAvatar';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Draggable Coach Item
const DraggableCoach = ({ coach }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `coach-${coach.id}`,
        data: { type: 'coach', coach },
    });

    const brandColor = coach.avatar_color || '#10b981';

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 border",
                "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50",
                isDragging ? "opacity-40 scale-105 shadow-xl z-50" : "hover:-translate-y-0.5"
            )}
            style={isDragging ? { borderColor: brandColor } : {}}
        >
            <div className="relative">
                <UserAvatar
                    profile={coach}
                    size="md"
                    className="ring-2 ring-transparent transition-all"
                    showTooltip={false}
                />
            </div>
            <div>
                <p className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                    {coach.first_name} {coach.last_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }}></span>
                    <p className="text-[10px] text-slate-500 group-hover:text-slate-700 uppercase tracking-wider font-medium">
                        {coach.role}
                    </p>
                </div>
            </div>

            {/* Grab Handle Icon */}
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-4 border-r-2 border-l-2 border-slate-300 h-3"></div>
            </div>
        </div>
    );
};

export default function SchedulerSidebar({ academyId, staffList = [] }: { academyId: string | null, staffList: any[] }) {
    // DraggableStaff is now driven by props, but we map it to ensure it flat structure if needed
    // The hook returns { profile: ... }, so we map it if necessary or just use it.
    // Let's assume passed staffList is already flattened or contains profile info.
    // Based on hook: it returns [{ profile_id, ... profile: {...} }]

    // We need to flatten it for the UI which expects simple coach object
    const draggableStaff = staffList.map((s: any) => s.profile || s).filter(Boolean);
    const loading = false; // Controlled by parent if needed, but for sidebar list it's fine to be instant updates

    return (
        <aside className="w-80 border-r border-slate-200 flex flex-col bg-white">
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                    <CalendarIcon className="text-emerald-600" />
                    Wibo Scheduler
                </h2>
                <p className="text-sm text-slate-500 mt-1">Drag coaches to assign sessions.</p>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Available Staff</span>
                    <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{draggableStaff.length}</span>
                </h3>

                {loading ? (
                    // Simple Skeleton
                    [1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white opacity-50">
                            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
                                <div className="h-2 w-1/3 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : draggableStaff.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                        <p className="text-sm text-slate-500 mb-3">No coaches found.</p>
                        <a href="/owner/staff" className="text-xs font-bold text-white bg-emerald-500 px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors inline-block">
                            Add to Directory
                        </a>
                    </div>
                ) : (
                    draggableStaff.map(coach => (
                        <DraggableCoach key={coach.id} coach={coach} />
                    ))
                )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
                <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300">
                    Auto-Schedule with Wibo AI
                </button>
            </div>
        </aside>
    );
}
