import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Session } from './mockData';
import { format } from 'date-fns';
import { AlertCircle, User as UserIcon } from 'lucide-react';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SessionCapsuleProps {
    session: Session;
    style?: React.CSSProperties;
}

export const SessionCapsule: React.FC<SessionCapsuleProps> = ({ session, style }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `session|${session.id}`, // NEW: Prefix for reliable drop detection
        data: { type: 'session', session },
    });

    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

    // Dynamic Color Logic
    const baseColor = session.locations?.color ? `bg-[${session.locations.color}]` : 'bg-slate-700';
    // Fallback if Tailwind doesn't support dynamic arb values well without safelist:
    // We might need style={{ backgroundColor: session.locations?.color }} if useScheduleData returns hex.

    const isPublished = session.is_published ?? true; // Default to true for backward comp if missing

    // Status Styles
    const statusStyles = {
        scheduled: 'border-l-4',
        completed: 'opacity-70 grayscale',
        cancelled: 'opacity-50 line-through',
    };

    const isConflict = false; // TODO: Implement conflict logic

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                backgroundColor: session.locations?.color || undefined
            }}
            className={cn(
                "relative rounded-xl p-3 mb-2 text-xs text-white shadow-sm transition-all duration-200 group overflow-hidden w-full cursor-pointer",
                "flex flex-col justify-between hover:z-10 hover:scale-[1.02] hover:shadow-md min-h-[90px]",
                !session.locations?.color && "bg-slate-700",

                // Draft Mode Visuals
                !isPublished && "border-2 border-dashed border-slate-300 opacity-80 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]",

                isConflict ? "animate-pulse ring-2 ring-red-500" : "hover:ring-2 hover:ring-opacity-50 hover:ring-slate-300",
                isOver ? "ring-2 ring-emerald-400 scale-[1.03] z-50 shadow-xl" : "",
            )}
        >
            {/* Draft Badge */}
            {!isPublished && (
                <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-bl-lg font-bold border-b border-l border-slate-300 z-20">
                    DRAFT
                </div>
            )}

            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 pointer-events-none" />

            {/* Header: Time & Warning */}
            <div className="relative flex justify-between items-start z-10 w-full mb-1">
                <span className="font-mono font-bold opacity-90 tracking-tighter text-[10px]">
                    {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                </span>
                {isConflict && (
                    <AlertCircle className="w-4 h-4 text-red-200 fill-red-600 animate-bounce" />
                )}
            </div>

            {/* Body: Job Type / Title */}
            <div className="relative z-10 my-1 flex-1">
                <h4 className="font-bold text-sm leading-tight truncate">{session.title || session.job_type || 'Shift'}</h4>
                <span className="text-[10px] uppercase tracking-wide opacity-80">{session.job_type}</span>
            </div>

            {/* Footer: Coach Assignment */}
            <div className={cn(
                "relative z-10 mt-1 flex items-center gap-2 rounded-lg px-2 py-1 backdrop-blur-sm",
                session.coach ? "bg-black/20" : "bg-white/10 border border-white/10"
            )}>
                {session.coach ? (
                    <>
                        <img
                            src={session.coach.avatar_url}
                            alt={session.coach.full_name}
                            className="w-5 h-5 rounded-full border border-white/50"
                        />
                        <span className="truncate font-medium">{session.coach.full_name}</span>
                    </>
                ) : (
                    <>
                        <UserIcon className="w-4 h-4 opacity-50" />
                        <span className="opacity-60 italic">Assign Coach</span>
                    </>
                )}
            </div>
        </div>
    );
};
