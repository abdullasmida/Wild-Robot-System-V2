import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
                setQuery('');
                setSelectedIndex(0);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const actions = [
        // Role Switching (Simulated)
        {
            section: 'Switch Role',
            name: 'Super Admin View',
            icon: 'security',
            shortcut: 'S A',
            action: () => switchRole('admin')
        },
        {
            section: 'Switch Role',
            name: 'Finance / Accountant View',
            icon: 'account_balance',
            shortcut: 'F N',
            action: () => switchRole('accountant')
        },
        {
            section: 'Switch Role',
            name: 'HR / Staff View',
            icon: 'badge',
            shortcut: 'H R',
            action: () => switchRole('hr')
        },
        {
            section: 'Switch Role',
            name: 'Manager View',
            icon: 'analytics',
            shortcut: 'M G',
            action: () => switchRole('manager')
        },
        {
            section: 'Switch Role',
            name: 'Admin View', // Requested "Admin" Role
            icon: 'admin_panel_settings',
            shortcut: 'A D',
            action: () => switchRole('admin_role') // Distinct from super admin 'admin'
        },
        {
            section: 'Switch Role',
            name: 'Coach View',
            icon: 'sports_gymnastics',
            shortcut: 'C O',
            action: () => switchRole('employee')
        },

        // Navigation
        {
            section: 'Navigation',
            name: 'Go to Dashboard',
            icon: 'dashboard',
            action: () => navigate('/coach/home')
        },
        {
            section: 'Navigation',
            name: 'Go to Master Calendar',
            icon: 'calendar_month',
            action: () => navigate('/coach/calendar')
        },
        {
            section: 'Navigation',
            name: 'Go to Analytics',
            icon: 'bar_chart',
            action: () => navigate('/coach/analytics')
        },
    ];

    const switchRole = (role) => {
        localStorage.setItem('simulated_role', role);
        window.location.reload();
    };

    const filteredActions = actions.filter((action) =>
        action.name.toLowerCase().includes(query.toLowerCase()) ||
        action.section.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (action) => {
        action.action();
        setIsOpen(false);
    };

    // Keyboard navigation for the list
    useEffect(() => {
        const handleListNav = (e) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % filteredActions.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + filteredActions.length) % filteredActions.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSelect(filteredActions[selectedIndex]);
            }
        };
        window.addEventListener('keydown', handleListNav);
        return () => window.removeEventListener('keydown', handleListNav);
    }, [isOpen, filteredActions, selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {/* Search Input */}
                <div className="flex items-center border-b border-slate-100 px-4">
                    <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                    <input
                        type="text"
                        className="w-full bg-transparent border-0 p-4 text-slate-800 placeholder-slate-400 focus:ring-0 text-lg font-medium outline-none"
                        placeholder="What do you need? (e.g. Finance, HR...)"
                        autoFocus
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="text-xs font-bold text-slate-400 border border-slate-200 rounded px-2 py-1">ESC</div>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                    {filteredActions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No results found.
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {filteredActions.map((action, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelect(action)}
                                    className={clsx(
                                        "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer group transition-colors",
                                        index === selectedIndex ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={clsx(
                                            "material-symbols-outlined text-xl transition-colors",
                                            index === selectedIndex ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-500"
                                        )}>
                                            {action.icon}
                                        </span>
                                        <div>
                                            <p className="font-bold text-sm">{action.name}</p>
                                            <p className="text-[10px] opacity-60 font-medium uppercase tracking-wider">{action.section}</p>
                                        </div>
                                    </div>
                                    {action.shortcut && (
                                        <div className="hidden sm:flex gap-1">
                                            {action.shortcut.split(' ').map((key, i) => (
                                                <kbd key={i} className={clsx(
                                                    "px-2 py-1 text-[10px] font-bold rounded border min-w-[1.2rem] text-center",
                                                    index === selectedIndex
                                                        ? "bg-white border-indigo-200 text-indigo-500 shadow-sm"
                                                        : "bg-slate-100 border-slate-200 text-slate-500"
                                                )}>
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">arrow_selector_tool</span> Select</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">keyboard_return</span> Enter</span>
                    </div>
                    <span>Wild Robot OS v3.0</span>
                </div>
            </div>
        </div>
    );
}
