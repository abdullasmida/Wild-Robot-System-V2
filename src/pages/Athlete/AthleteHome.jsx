import React from 'react';
import { clsx } from 'clsx';

export default function StudentHome() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-800">Hi, Champ! 👋</h1>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200" role="region" aria-label="Next Session">
                <p className="opacity-80 font-medium mb-1">Next Session</p>
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-black">Tomorrow</h2>
                        <p className="text-lg">4:00 PM • BJJ Fundamentals</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm" aria-hidden="true">
                        <span className="material-symbols-outlined text-[28px]">calendar_clock</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-4xl text-amber-500 mb-2" aria-hidden="true">emoji_events</span>
                    <span className="text-2xl font-black text-slate-800">12</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Medals</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2" aria-hidden="true">bolt</span>
                    <span className="text-2xl font-black text-slate-800">95%</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Attendance</span>
                </div>
            </div>
        </div>
    );
}
