import React from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, Wallet, Send, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ScheduleControlBarProps {
    // Data
    branches: { id: string; name: string }[];
    selectedBranchId: string;
    stats: {
        totalBudget: number;
        totalHours: number;
    };
    publishStatus: {
        hasDrafts: boolean;
        draftCount: number;
    };

    // Actions
    onBranchChange: (id: string) => void;
    onPublish: () => void;
    onViewChange: (view: 'day' | 'week') => void;
    onDateChange: (direction: 'prev' | 'next' | 'today') => void;

    // State
    currentView: 'day' | 'week';
    currentDate: Date;
    isPublishing: boolean;
}

export const ScheduleControlBar: React.FC<ScheduleControlBarProps> = ({
    branches,
    selectedBranchId,
    stats,
    publishStatus,
    onBranchChange,
    onPublish,
    onViewChange,
    onDateChange,
    currentView,
    currentDate,
    isPublishing
}) => {

    // Budget Color Logic
    const isBudgetHigh = stats.totalBudget > 5000; // Mock threshold

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-40 relative">

            {/* LEFT: Controls */}
            <div className="flex items-center gap-3 flex-1">
                {/* Branch Selector */}
                <div className="relative group">
                    <select
                        value={selectedBranchId}
                        onChange={(e) => onBranchChange(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <option value="all">All Locations</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <LayoutGrid size={16} />
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => onViewChange('day')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                            currentView === 'day' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => onViewChange('week')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                            currentView === 'week' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Week
                    </button>
                </div>
            </div>

            {/* CENTER: Date Navigation */}
            <div className="flex items-center gap-4 justify-center flex-1">
                <button
                    onClick={() => onDateChange('prev')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center min-w-[200px]">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 justify-center">
                        <CalendarIcon size={18} className="text-emerald-500" />
                        {currentView === 'week' ? (
                            <span>Week of {format(currentDate, 'MMM do')}</span>
                        ) : (
                            format(currentDate, 'EEEE, MMM do')
                        )}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => onDateChange('today')}>
                        Jump to Today
                    </p>
                </div>
                <button
                    onClick={() => onDateChange('next')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* RIGHT: Stats & Actions */}
            <div className="flex items-center gap-4 justify-end flex-1">

                {/* Budget Widget */}
                <div className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors",
                    isBudgetHigh ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                )}>
                    <div className={cn(
                        "p-1.5 rounded-lg",
                        isBudgetHigh ? "bg-red-100" : "bg-emerald-100"
                    )}>
                        <Wallet size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">Weekly Budget</p>
                        <p className="text-sm font-black">
                            AED {stats.totalBudget.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Publish Button */}
                <button
                    onClick={onPublish}
                    disabled={!publishStatus.hasDrafts || isPublishing}
                    className={cn(
                        "px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95 border border-transparent",
                        publishStatus.hasDrafts
                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 animate-pulse-slow"
                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none"
                    )}
                >
                    {isPublishing ? (
                        <>Publishing...</>
                    ) : publishStatus.hasDrafts ? (
                        <>
                            <Send size={16} />
                            Publish ({publishStatus.draftCount})
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={16} />
                            All Published
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
