import React from 'react';
import { clsx } from 'clsx';
import useGeofencing from '../../hooks/useGeofencing';
import { BRANCHES } from '../../utils/constants';

export default function NextMissionCard() {
    // Mock Config
    const targetBranch = BRANCHES[0];
    const { distance, isWithinRange, error: gpsError } = useGeofencing(targetBranch.lat, targetBranch.lng);
    const [isClockedIn, setIsClockedIn] = React.useState(false);

    // Format Distance
    const distanceDisplay = distance
        ? distance < 1000
            ? `${Math.round(distance)}m`
            : `${(distance / 1000).toFixed(1)}km`
        : 'Locating...';

    // State A: Far Away (Dark)
    if (!isWithinRange && !isClockedIn) {
        return (
            <div className="bg-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl mb-8 border border-slate-700">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-slate-700/50 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl">directions_car</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">Heading to {targetBranch.label}...</h2>
                        <p className="text-slate-400 font-medium">Distance: {distanceDisplay}</p>
                    </div>
                </div>
                <button
                    disabled
                    className="w-full md:w-auto bg-slate-700 text-slate-500 px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 cursor-not-allowed border border-slate-600"
                >
                    <span className="material-symbols-outlined">block</span>
                    GET CLOSER TO CLOCK IN
                </button>
            </div>
        );
    }

    // State B: In Zone (Green/Pulsing) or Clocked In
    return (
        <div className="bg-emerald-600 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-200/50 mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500"></div>

            {/* Pulsing circles background */}
            {!isClockedIn && (
                <>
                    <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white opacity-10 rounded-full animate-ping"></div>
                    <div className="absolute right-10 top-10 w-24 h-24 bg-white opacity-10 rounded-full animate-pulse"></div>
                </>
            )}

            <div className="relative z-10 flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-sm ring-1 ring-white/30">
                    <span className="material-symbols-outlined text-4xl">
                        {isClockedIn ? 'verified' : 'location_on'}
                    </span>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        {isClockedIn ? 'Shift Active' : `You have arrived at ${targetBranch.label}!`}
                    </h2>
                    <p className="text-emerald-100 font-bold opacity-90">
                        {isClockedIn ? 'Time tracked: 00:05' : 'Ready to start your mission?'}
                    </p>
                </div>
            </div>

            <button
                onClick={() => setIsClockedIn(!isClockedIn)}
                className="relative z-10 w-full md:w-auto bg-white text-emerald-600 px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
            >
                <span className="material-symbols-outlined">
                    {isClockedIn ? 'stop_circle' : 'timer'}
                </span>
                {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN NOW'}
            </button>
        </div>
    );
}
