import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { clsx } from 'clsx';

const SUPER_ADMIN_ID = 'e9dc1d40-8fa5-4334-bea9-6b9424d2705a';

export default function SafeRoleSwitcher() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentRole, setCurrentRole] = useState(localStorage.getItem('simulated_role') || 'admin');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        // In a real scenario, strict check:
        // if (user && user.id === SUPER_ADMIN_ID) {
        // For development speed, I will enable it if there is ANY user logged in OR blindly enabled for dev if requested.
        // The user explicitly asked for logic: Check if user.id === ...

        if (user && user.id === SUPER_ADMIN_ID) {
            setIsVisible(true);
        } else {
            // Fallback for testing if I cannot easily log in as that specific user right now?
            // The user gave me a specific ID. I should respect it.
            // However, for the purpose of the user *seeing* it working now, unauthenticated or with different ID might hide it.
            // I'll add a temporary bypass for verification if specific ID check fails, 
            // BUT I will comment it out to strictly follow instructions first.
            // actually, the user *is* the Super Admin in this context usually.

            // FOR TESTING PURPOSES: If the user provided ID is just a placeholder and I can't login as them,
            // I might fail to show it.
            // Let's assume the current user is that ID or I'll add a 'dev' override locally if needed.
            // Re-reading: "The user (Super Admin ID: ...) needs to simulate..."
            // I will implement the check strictly.
            if (user?.id === SUPER_ADMIN_ID) {
                setIsVisible(true);
            }
        }
    }

    const handleRoleChange = (role) => {
        localStorage.setItem('simulated_role', role);
        setCurrentRole(role);
        window.location.reload(); // Hard reload to apply changes everywhere
    };

    if (!isVisible) return null;

    const roles = [
        { id: 'admin', label: 'Super Admin', icon: 'security', color: 'bg-slate-900 text-white' },
        { id: 'manager', label: 'Activity Manager', icon: 'analytics', color: 'bg-indigo-600 text-white' },
        { id: 'head_coach', label: 'Head Coach', icon: 'sports', color: 'bg-orange-600 text-white' },
        { id: 'hr', label: 'HR Manager', icon: 'badge', color: 'bg-pink-600 text-white' },
        { id: 'accountant', label: 'Accountant', icon: 'account_balance', color: 'bg-green-600 text-white' },
        { id: 'employee', label: 'Coach (Employee)', icon: 'engineering', color: 'bg-blue-600 text-white' },
        { id: 'freelance', label: 'Coach (Freelance)', icon: 'work_history', color: 'bg-purple-600 text-white' },
    ];

    const activeRole = roles.find(r => r.id === currentRole) || roles[0];

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {isOpen && (
                <div className="mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 w-48">
                    <div className="bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Simulate Role
                    </div>
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleChange(role.id)}
                            className={clsx(
                                "w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors",
                                currentRole === role.id ? "text-slate-900 bg-slate-50" : "text-slate-500"
                            )}
                        >
                            <div className={clsx("h-2 w-2 rounded-full", currentRole === role.id ? "bg-emerald-500" : "bg-slate-300")} />
                            {role.label}
                        </button>
                    ))}
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-4 py-3 rounded-full shadow-xl hover:scale-105 transition-all active:scale-95 font-bold border-2 border-white/20 backdrop-blur-md",
                    activeRole.color
                )}
            >
                <span className="material-symbols-outlined text-[20px]">{activeRole.icon}</span>
                <span className="text-sm">{activeRole.label} View</span>
                <span className="material-symbols-outlined text-[16px] opacity-60">
                    {isOpen ? 'close' : 'expand_less'}
                </span>
            </button>
        </div>
    );
}
