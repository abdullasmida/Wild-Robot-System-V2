import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import OperationsFAB from './OperationsFAB';
import ChatWidget from './ChatWidget';
import FeedbackModal from './FeedbackModal';
import ChaosMonkey from './DevTools/ChaosMonkey';

export default function Layout() {
    const location = useLocation();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">

            {/* Desktop Sidebar (Left) - Hidden on Mobile */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-50">
                {/* Logo Area */}
                <div className="p-6 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-200">
                            WR
                        </div>
                        <h1 className="font-black text-slate-800 tracking-tight text-lg">Wild Robot</h1>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <SidebarItem to="/home" icon="home" label="Home" active={location.pathname === '/home'} />
                    <SidebarItem to="/schedule" icon="calendar_today" label="Schedule" active={location.pathname === '/schedule'} />
                    <SidebarItem to="/roster" icon="groups" label="Roster" active={location.pathname === '/roster'} />
                    <SidebarItem to="/chat" icon="chat_bubble" label="Chat" active={location.pathname.startsWith('/chat')} />
                    <SidebarItem to="/profile" icon="person" label="Profile" active={location.pathname === '/profile'} />
                </nav>

                {/* Footer/User Area */}
                <div className="p-4 border-t border-gray-50 space-y-2">
                    <NavLink
                        to="/subscription"
                        className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl group transition-all hover:shadow-sm"
                    >
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Upgrade Plan 🚀</p>
                            <p className="text-[10px] text-slate-500">Unlock more power</p>
                        </div>
                    </NavLink>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-slate-500 hover:text-slate-800 pl-2 group"
                        onClick={() => setIsFeedbackOpen(true)}
                    >
                        <span className="material-symbols-outlined mr-2 text-[20px] group-hover:text-amber-500 transition-colors">campaign</span>
                        Feedback & Support
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-slate-500 hover:text-red-500 pl-2"
                        onClick={() => console.log('Logout')}
                    >
                        <span className="material-symbols-outlined mr-2 text-[20px]">logout</span>
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <main className="flex-1 bg-background-light dark:bg-background-dark min-h-screen transition-all duration-300 md:ml-64 pb-[80px] md:pb-0">
                <Outlet />
            </main>

            {/* Global FAB (Fixed position handles itself, but maybe adjust for desktop?) */}
            <OperationsFAB />

            {/* AI Assistant Widget */}
            <ChatWidget />

            {/* Feedback Modal */}
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

            {/* Dev Tools - Chaos Monkey */}
            <ChaosMonkey />

            {/* Mobile Bottom Navigation - Hidden on Desktop */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#10221c] border-t border-gray-100 dark:border-gray-800 z-50 h-[70px] pb-safe">
                <ul className="flex items-center justify-between max-w-md mx-auto h-full px-2">
                    <NavItem to="/home" icon="home" label="Home" active={location.pathname === '/home'} />
                    <NavItem to="/schedule" icon="calendar_today" label="Schedule" active={location.pathname === '/schedule'} />
                    <NavItem to="/roster" icon="groups" label="Roster" active={location.pathname === '/roster'} />
                    <NavItem to="/chat" icon="chat_bubble" label="Chat" active={location.pathname.startsWith('/chat')} />
                    <NavItem to="/profile" icon="person" label="Profile" active={location.pathname === '/profile'} />
                </ul>
            </nav>
        </div>
    );
}

function SidebarItem({ to, icon, label, active }) {
    return (
        <NavLink
            to={to}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group",
                active
                    ? "bg-emerald-50 text-emerald-600 font-bold shadow-sm"
                    : "text-slate-500 hover:bg-gray-50 hover:text-slate-800"
            )}
        >
            <span className={clsx("material-symbols-outlined text-[20px]", active && "[font-variation-settings:'FILL'_1]")}>
                {icon}
            </span>
            {label}
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
        </NavLink>
    );
}

function NavItem({ to, icon, label, active }) {
    return (
        <li className="flex-1 h-full">
            <NavLink
                to={to}
                className={clsx(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                    active ? "text-primary" : "text-slate-400 hover:text-primary"
                )}
            >
                <span className={clsx("material-symbols-outlined text-[26px]", active && "[font-variation-settings:'FILL'_1]")}>
                    {icon}
                </span>
                <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
        </li>
    );
}

// Simple Button dummy to avoid import errors if not generic
function Button({ children, className, onClick }) {
    return (
        <button onClick={onClick} className={clsx("flex items-center rounded-lg px-3 py-2 transition-colors", className)}>
            {children}
        </button>
    );
}
