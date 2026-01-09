import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    Activity,
    Contact,
    Trophy,
    Wallet,
    Settings,
    Bell,
    Plus,
    ChevronDown,
    Menu,
    ChevronRight,
    LogOut,
    Crown,
    ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import UniversalAddModal from '../components/modals/UniversalAddModal';
import NewShiftModal from '../components/modals/NewShiftModal';
import NotificationsDrawer from '../components/notifications/NotificationsDrawer';
import SidebarUserItem from '../components/dashboard/SidebarUserItem';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import TeamChatWidget from '@/components/chat/TeamChatWidget';
import AcademySetup from '@/pages/owner/AcademySetup';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CommandLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

    const { user, loading } = useAuthStore();
    const { viewMode } = useAppStore();
    const academy = user?.academy;

    // --- ENFORCE SETUP ---
    const hasAcademyName = user?.academy?.name && user.academy.name.trim().length > 0;
    if (!loading && user?.role === 'owner' && !hasAcademyName) {
        return <AcademySetup />;
    }

    // Modal States
    const [isUniversalModalOpen, setIsUniversalModalOpen] = useState(false);
    const [universalModalTab, setUniversalModalTab] = useState(0);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // --- COMMAND SIDEBAR ITEMS ---
    const sidebarItems = [
        { label: 'Command Center', icon: LayoutDashboard, path: '/command/dashboard' },
        { label: 'Master Schedule', icon: CalendarDays, path: '/command/schedule' },
        { label: 'Live Operations', icon: Activity, path: '/command/feed' },
        { label: 'Team Directory', icon: Contact, path: '/command/staff' },
        { label: 'Heroes Roster', icon: Trophy, path: '/command/athletes' },
        { label: 'Treasury', icon: Wallet, path: '/command/finance' },
        { label: 'HQ Settings', icon: Settings, path: '/command/settings' },
    ];

    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30">
            {/* Modals */}
            <UniversalAddModal
                isOpen={isUniversalModalOpen}
                onClose={() => setIsUniversalModalOpen(false)}
                type={universalModalTab === 0 ? 'staff' : 'athlete'}
                academyId={academy?.id}
            />
            <NewShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} />
            <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            {/* SIDEBAR (Desktop) */}
            <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 bg-slate-900/95 backdrop-blur-xl text-white z-30 relative overflow-hidden">
                {/* Gold Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="h-20 flex items-center px-6 border-b border-white/10 relative z-10">
                    <Link to="/command/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Crown className="w-5 h-5 text-white" fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight text-white leading-none">
                                {academy?.name || 'Wild Robot'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">
                                Command Center
                            </span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto relative z-10">
                    <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Main Menu</div>
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />}
                                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Quick Access Actions */}
                    <div className="mt-8 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Actions</div>
                    <button onClick={() => { setUniversalModalTab(0); setIsUniversalModalOpen(true); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <Plus className="w-4 h-4" /> Add Staff Member
                    </button>
                    <button onClick={() => { setUniversalModalTab(1); setIsUniversalModalOpen(true); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <Plus className="w-4 h-4" /> Recruit Hero
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/20 relative z-10">
                    <SidebarUserItem theme="dark" />
                </div>
            </aside>

            {/* MAIN CONTENT Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* TOP BAR */}
                <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                            {pathSegments.map((segment, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
                                    <span className={cn("capitalize", index === pathSegments.length - 1 && "text-slate-900 font-bold")}>
                                        {segment}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsNotificationsOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
                        <span className="text-sm font-bold text-emerald-600 hidden md:inline-block">HQ Online</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-slate-50 relative p-6">
                    <Outlet />
                </main>
            </div>

            <TeamChatWidget />
        </div>
    );
};

export default CommandLayout;
