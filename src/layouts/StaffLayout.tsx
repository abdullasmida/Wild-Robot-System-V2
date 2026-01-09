import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    MessageSquare,
    User,
    Settings,
    Bell,
    Menu,
    LogOut,
    Shield,
    ChevronRight
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
    const { user } = useAuthStore();
    const academy = user?.academy;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const sidebarItems = [
        { label: 'My Desk', icon: LayoutDashboard, path: '/staff/dashboard' },
        { label: 'My Schedule', icon: CalendarDays, path: '/staff/schedule' },
        { label: 'Team Chat', icon: MessageSquare, path: '/staff/chat' },
        { label: 'My Profile', icon: User, path: '/staff/profile' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
            <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            {/* SIDEBAR (Desktop) - Blue/Slate Theme */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white z-30">
                <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-slate-50/50">
                    <Link to="/staff/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-none">
                                {academy?.name || 'Wild Robot'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-1">
                                Field Ops
                            </span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <SidebarUserItem />
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
                        <span className="font-bold text-slate-700 capitalize">
                            Field Operations
                        </span>
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
