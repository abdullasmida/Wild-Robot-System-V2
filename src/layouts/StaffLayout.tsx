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
    UserPlus,
    CalendarPlus,
    Shield,
    LogOut,
    Users,
    User
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Imports for Modals & Widgets
import UniversalAddModal from '../components/modals/UniversalAddModal';
import NewShiftModal from '../components/modals/NewShiftModal';
import RecruitHeroesModal from '../components/modals/RecruitHeroesModal';
import NotificationsDrawer from '../components/notifications/NotificationsDrawer';
import SidebarUserItem from '../components/dashboard/SidebarUserItem';
import ClockInWidget from '../components/coach/ClockInWidget';

import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// 1. Define All Possible Items
// ----------------------------------------------------------------------
const ALL_NAV_ITEMS = [
    // Common
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard', roles: ['owner', 'coach', 'manager', 'head_coach'] },

    // Coach Specific
    { id: 'my_schedule', label: 'My Schedule', icon: CalendarDays, path: '/staff/schedule', roles: ['coach', 'head_coach'] },
    { id: 'my_athletes', label: 'My Squad', icon: Users, path: '/staff/roster', roles: ['coach', 'head_coach'] },

    // Owner / Admin Specific
    { id: 'master_schedule', label: 'Master Schedule', icon: CalendarDays, path: '/staff/schedule', roles: ['owner', 'manager'] }, // Note: Same path, different view handled by App.tsx
    { id: 'feed', label: 'Live Feed', icon: Activity, path: '/staff/feed', roles: ['owner', 'manager'] },
    { id: 'staff', label: 'Team Directory', icon: Contact, path: '/staff/team', roles: ['owner', 'manager'] },
    { id: 'all_athletes', label: 'Heroes (All)', icon: Trophy, path: '/staff/athletes', roles: ['owner', 'manager'] },
    { id: 'treasury', label: 'Treasury', icon: Wallet, path: '/staff/treasury', roles: ['owner'] },

    // Common Footer
    { id: 'settings', label: 'Settings', icon: Settings, path: '/staff/settings', roles: ['owner', 'manager'] },
    { id: 'profile', label: 'My Profile', icon: User, path: '/staff/profile', roles: ['coach', 'head_coach'] }, // Owner accesses profile via avatar usually, but can add here
];

const StaffLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

    // Modal States
    const [isUniversalModalOpen, setIsUniversalModalOpen] = useState(false);
    const [universalModalTab, setUniversalModalTab] = useState(0);
    const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const { user, signOut } = useAuthStore();
    const { viewMode } = useAppStore();

    const academy = user?.academy;
    const userRole = user?.role || 'coach'; // Fallback to coach structure if undefined to be safe (or strict?)

    // Filter Items based on Role
    const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));

    // Breadcrumbs
    const pathSegments = location.pathname.split('/').filter(Boolean);

    const openUniversalModal = (tabIndex: number) => {
        setIsQuickActionOpen(false);
        setUniversalModalTab(tabIndex);
        setIsUniversalModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30">

            {/* Modals Layer */}
            <UniversalAddModal
                isOpen={isUniversalModalOpen}
                onClose={() => setIsUniversalModalOpen(false)}
                initialTab={universalModalTab}
                academyId={academy?.id}
            />
            <NewShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} />
            <RecruitHeroesModal
                isOpen={isAthleteModalOpen}
                onClose={() => setIsAthleteModalOpen(false)}
                onSuccess={() => { }}
            />
            <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            {/* ----------------------------------------------------------------------
                SIDEBAR (Desktop)
            ---------------------------------------------------------------------- */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white z-30">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <Link to="/staff/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className={`w-8 h-8 rounded-lg mr-3 shadow-lg flex items-center justify-center text-white font-bold
                            ${userRole === 'owner' ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-emerald-500/20' : 'bg-gradient-to-tr from-slate-700 to-slate-900 shadow-slate-500/20'}
                        `}>
                            {userRole === 'owner' ? 'W' : 'C'}
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-none">Wild Robot</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {userRole === 'owner' ? 'Command Center' : 'Staff Portal'}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group relative overflow-hidden",
                                    "transition-all duration-200",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500"
                                        : "border-l-4 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-1"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-colors relative z-10", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-900")} />
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Sign Out */}
                    <button
                        onClick={async () => {
                            await signOut();
                            window.location.href = '/login';
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group relative overflow-hidden mt-8 border-l-4 border-transparent text-slate-500 hover:text-red-600 hover:bg-red-50 hover:translate-x-1 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors relative z-10" />
                        <span className="relative z-10">Sign Out</span>
                    </button>
                </nav>

                {/* User Stub */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <SidebarUserItem />
                </div>
            </aside>

            {/* ----------------------------------------------------------------------
                MAIN CONTENT
            ---------------------------------------------------------------------- */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Header */}
                <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-20 sticky top-0">

                    {/* Left: Mobile Toggle & Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                            {/* Simple Breadcrumb */}
                            <span className="opacity-50">Staff</span>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                            <span className="font-medium text-slate-900 capitalize">{pathSegments[1] || 'Dashboard'}</span>
                        </div>
                    </div>

                    {/* Center: Branch Selector (Owner) OR Welcome (Coach) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 hidden md:block">
                        {userRole === 'owner' ? (
                            <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50/50 hover:bg-white transition-all text-sm font-medium hover:border-slate-300 group shadow-sm hover:shadow">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-slate-700">{academy?.name || 'My Academy'}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 opacity-80">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coach Mode</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">

                        {/* Clock In Widget (Only for Staff/Coach) */}
                        {userRole !== 'owner' && <ClockInWidget />}

                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className={cn(
                                "relative p-2 rounded-lg transition-colors",
                                isNotificationsOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>

                        {/* Quick Action (Visible to all, but actions might differ? For now allow all) */}
                        <div className="relative">
                            <button
                                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                                className={cn(
                                    "bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-2 md:px-4 md:py-2 rounded-lg md:rounded-full flex items-center gap-2 shadow-[0_4px_14px_rgba(16,185,129,0.4)] transition-all transform active:scale-95",
                                    isQuickActionOpen && "ring-2 ring-emerald-500/30"
                                )}
                            >
                                <Plus className={cn("w-5 h-5 transition-transform", isQuickActionOpen ? "rotate-45" : "")} />
                                <span className="hidden md:inline">Quick Action</span>
                            </button>

                            {/* Dropdown */}
                            {isQuickActionOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsQuickActionOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="p-1">
                                            {/* Common */}
                                            <button onClick={() => { setIsQuickActionOpen(false); setIsShiftModalOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium">
                                                <CalendarPlus className="w-4 h-4 text-purple-500" /> New Shift
                                            </button>

                                            {/* Owner Only */}
                                            {userRole === 'owner' && (
                                                <>
                                                    <button onClick={() => { setIsQuickActionOpen(false); setIsAthleteModalOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium">
                                                        <Shield className="w-4 h-4 text-blue-500" /> Add Athlete
                                                    </button>
                                                    <button onClick={() => { setIsQuickActionOpen(false); openUniversalModal(0); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium">
                                                        <UserPlus className="w-4 h-4 text-emerald-500" /> Add Staff
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto bg-slate-50 relative p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay (Simplified) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="relative w-[80vw] max-w-sm bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
                        {/* Mobile Nav contents matching Desktop... */}
                        <div className="overflow-y-auto flex-1">
                            {navItems.map(item => (
                                <Link key={item.id} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50">
                                    <item.icon className="w-5 h-5" /> {item.label}
                                </Link>
                            ))}
                        </div>
                    </aside>
                </div>
            )}

        </div>
    );
};

export default StaffLayout;
