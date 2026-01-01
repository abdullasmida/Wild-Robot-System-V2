import React from 'react';
import { Trophy, Activity, Calendar, MoreHorizontal } from 'lucide-react';

const AthleteCard = ({ athlete }) => {
    // Derivations
    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const statusColors = {
        active: 'border-emerald-500 bg-emerald-50 text-emerald-700',
        inactive: 'border-slate-200 bg-slate-50 text-slate-400',
        injured: 'border-red-200 bg-red-50 text-red-600'
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">

            {/* Top Bar Background */}
            <div className={`h-24 ${athlete.status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-100'}`}></div>

            {/* Avatar & Info */}
            <div className="px-6 -mt-12 mb-4">
                <div className="relative inline-block">
                    <img
                        src={athlete.photo_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${athlete.name}`}
                        alt={athlete.name}
                        className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-white object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white ${athlete.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                </div>

                <div className="mt-3 flex justify-between items-start">
                    <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight">{athlete.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Age {calculateAge(athlete.dob)} • {athlete.gender || 'Athlete'}
                        </p>
                    </div>
                    <button className="text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Stats Bar (FIFA Style) */}
            <div className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                    <div className="text-center px-2">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Rating</div>
                        <div className="font-black text-lg text-emerald-600 flex items-center justify-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {athlete.stats?.overall || 88}
                        </div>
                    </div>
                    <div className="text-center px-2">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Health</div>
                        <div className="font-black text-lg text-blue-600 flex items-center justify-center gap-1">
                            <Activity className="w-4 h-4" />
                            98%
                        </div>
                    </div>
                    <div className="text-center px-2">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Since</div>
                        <div className="font-black text-sm text-slate-700 flex items-center justify-center gap-1 h-full pt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            2024
                        </div>
                    </div>
                </div>

                {/* Tags (Medical) */}
                {athlete.medical_info?.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {athlete.medical_info.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AthleteCard;
