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
        id: session.id,
        data: { type: 'session', session },
    });

    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

    // Dynamic Neon Styles based on Batch Color or Status
    // Using inline styles for dynamic colors usually, but here using Tailwind classes mapped in mockData
    // session.batch.color (e.g. 'bg-rose-500')

    const baseColor = session.batch.color || 'bg-slate-700';

    // Conflict Animation
    const isConflict = session.wibo_conflict_flag;

    const statusStyles = {
        scheduled: 'border-l-4',
        completed: 'opacity-70 grayscale',
        cancelled: 'opacity-50 line-through',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative rounded-xl p-2 text-xs text-white shadow-lg transition-all duration-300 group overflow-hidden",
                "flex flex-col justify-between hover:z-10 hover:scale-[1.02]",
                baseColor,
                statusStyles[session.status],
                isConflict ? "animate-pulse ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" : "shadow-[0_0_10px_rgba(0,0,0,0.3)]",
                isOver ? "ring-2 ring-white scale-105" : "",
                !session.coach && !isConflict && "border-2 border-dashed border-white/30" // Visual cue for unassigned
            )}
        >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 pointer-events-none" />

            {/* Header: Time & Warning */}
            <div className="relative flex justify-between items-start z-10 w-full">
                <span className="font-mono font-bold opacity-90 tracking-tighter">
                    {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                </span>
                {isConflict && (
                    <AlertCircle className="w-4 h-4 text-red-200 fill-red-600 animate-bounce" />
                )}
            </div>

            {/* Body: Batch Name */}
            <div className="relative z-10 my-1">
                <h4 className="font-bold text-sm leading-tight truncate">{session.batch.name}</h4>
                <span className="text-[10px] uppercase tracking-wide opacity-80">{session.batch.level_name}</span>
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
