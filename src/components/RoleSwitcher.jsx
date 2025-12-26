import React from 'react';
import { useRole, ROLES } from '../context/RoleContext';
import { clsx } from 'clsx';

export default function RoleSwitcher() {
    const context = useRole();
    if (!context) return null;
    const { currentRole, switchRole, isDevMode } = context;

    // if (!isDevMode) return null; // Removed to force visibility check

    const roleConfig = {
        [ROLES.SUPER_ADMIN]: { label: 'Super Admin', icon: 'crown', color: 'bg-amber-100 text-amber-600 border-amber-200' },
        [ROLES.EMPLOYEE_COACH]: { label: 'Employee Coach', icon: 'sports_gymnastics', color: 'bg-blue-100 text-blue-600 border-blue-200' },
        [ROLES.FREELANCE_COACH]: { label: 'Freelance Coach', icon: 'work', color: 'bg-purple-100 text-purple-600 border-purple-200' },
        [ROLES.STUDENT]: { label: 'Student View', icon: 'school', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    };

    return (
        <div className="relative group z-50">
            <button className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm",
                roleConfig[currentRole].color
            )}>
                <span className="material-symbols-outlined text-[14px]">
                    {roleConfig[currentRole].icon}
                </span>
                <span>Viewing as: {roleConfig[currentRole].label}</span>
                <span className="material-symbols-outlined text-[14px] opacity-50">expand_more</span>
            </button>

            {/* Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 mb-1">Switch Perspective</div>
                {Object.values(ROLES).map((role) => (
                    <button
                        key={role}
                        onClick={() => switchRole(role)}
                        className={clsx(
                            "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
                            currentRole === role ? "bg-slate-50 text-slate-900 border border-slate-100 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {roleConfig[role].icon}
                        </span>
                        {roleConfig[role].label}
                        {currentRole === role && <span className="material-symbols-outlined text-emerald-500 ml-auto text-sm">check</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}
