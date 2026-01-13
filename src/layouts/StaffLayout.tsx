import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    MessageSquare,
    User,
    Settings,
    Bell,
    Menu,
    LogOut,
    Shield,
    ChevronRight,
    Dumbbell,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import NotificationsDrawer from '../components/notifications/NotificationsDrawer';
import SidebarUserItem from '../components/dashboard/SidebarUserItem';
import { useAuthStore } from '@/stores/useAuthStore';
import TeamChatWidget from '@/components/chat/TeamChatWidget';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const StaffLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { user } = useAuthStore();
    const academy = user?.academy;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const sidebarItems = [
        { label: 'My Desk', icon: LayoutDashboard, path: '/staff/dashboard' },
        { label: 'My Schedule', icon: CalendarDays, path: '/staff/schedule' },
        { label: 'Academic Calendar', icon: BookOpen, path: '/staff/calendar' },
        { label: 'Skill Library', icon: Dumbbell, path: '/staff/training' },
        { label: 'Team Chat', icon: MessageSquare, path: '/staff/chat' },
        { label: 'My Profile', icon: User, path: '/staff/profile' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
            <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            {/* SIDEBAR (Desktop) - Blue/Slate Theme */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r border-slate-200 bg-white z-30 transition-all duration-300 ease-in-out",
                    isSidebarCollapsed ? "w-20" : "w-64"
                )}
            >
                <div className="h-16 flex items-center px-4 border-b border-slate-100 bg-slate-50/50 relative">
                    <Link to="/staff/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity overflow-hidden">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div className={cn("flex flex-col min-w-0 transition-opacity duration-300", isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                            <span className="font-bold text-slate-900 leading-none truncate block max-w-[140px]">
                                Wild Robot
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-1 truncate">
                                Field Ops
                            </span>
                        </div>
                    </Link>

                    {/* Floating Toggle Button (Edge) */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="absolute -right-3 top-6 z-50 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 rotate-180" />}
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                                    isSidebarCollapsed && "justify-center px-0"
                                )}
                                title={isSidebarCollapsed ? item.label : undefined}
                            >
                                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className={cn("p-4 border-t border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center text-center transition-all", isSidebarCollapsed && "opacity-0")}>
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                        Powered by
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap uppercase tracking-wider">
                        {academy?.name || 'Wild Robot'}
                    </span>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                            {/* Academy Name First */}
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold border border-blue-100/50">
                                {academy?.name || 'My Academy'}
                            </div>

                            <ChevronRight className="w-4 h-4 opacity-50" />

                            <span className="capitalize font-medium text-slate-600">Field Ops</span>

                            {location.pathname.split('/').slice(2).map((segment, index) => (
                                <React.Fragment key={index}>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                    <span className={cn("capitalize", index === location.pathname.split('/').slice(2).length - 1 && "text-slate-900 font-bold")}>
                                        {segment}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsNotificationsOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-[1px] bg-slate-100" />
                        <SidebarUserItem condensed />
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6 pb-24 md:pb-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Nav (Optional, reusing sidebar for now but Mobile Menu Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="relative w-[70vw] bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left">
                        <div className="font-bold text-xl mb-6 text-blue-600">Field Ops</div>
                        <nav className="space-y-2">
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-700 font-medium hover:bg-blue-50"
                                >
                                    <item.icon className="w-5 h-5 text-blue-500" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            <TeamChatWidget />
        </div>
    );
};

export default StaffLayout;
