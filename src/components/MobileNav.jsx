import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

export default function MobileNav() {
    const navItems = [
        { name: 'Home', path: '/coach/home', icon: 'dashboard' },
        { name: 'Schedule', path: '/coach/schedule', icon: 'calendar_today' },
        { name: 'Assess', path: '/coach/skills', icon: 'assignment_turned_in' },
        { name: 'Earnings', path: '/coach/earnings', icon: 'account_balance_wallet' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe-area-inset-bottom">
            <nav className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                            isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={clsx(
                                    "material-symbols-outlined text-[24px] transition-transform",
                                    isActive && "scale-110" // Subtle pop
                                )}>
                                    {item.icon}
                                </span>
                                <span className="text-[10px] font-bold tracking-tight">
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 h-[2px] w-8 bg-emerald-500 rounded-full" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
