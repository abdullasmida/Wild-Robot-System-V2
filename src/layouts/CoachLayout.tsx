import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    User,
    Menu,
    LogOut,
    Bell,
    ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUser } from '@/context/UserContext';
import { supabase } from '../supabaseClient';
import ClockInWidget from '../components/coach/ClockInWidget';
import SidebarUserItem from '../components/dashboard/SidebarUserItem';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const SIDEBAR_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/coach/dashboard' },
    { label: 'My Schedule', icon: CalendarDays, path: '/coach/schedule' },
    { label: 'My Athletes', icon: Users, path: '/coach/athletes' },
    { label: 'Profile', icon: User, path: '/coach/profile' },
];

const CoachLayout = () => {
    const location = useLocation();
    const { user, profile } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900 z-30">
                {/* Logo */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800">
                    <Link to="/coach/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-emerald-300 rounded-lg mr-3 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                        <div>
                            <span className="font-bold text-lg tracking-tight text-white block leading-none">Wild Robot</span>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Coach Portal</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium group relative overflow-hidden transition-all duration-200",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <SidebarUserItem />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative bg-slate-50">

                {/* Top Bar */}
                <header className="h-20 border-b border-slate-200 bg-white sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm">
                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Left: Greeting (Desktop) */}
                    <div className="hidden md:block">
                        <h1 className="text-xl font-bold text-slate-800">
                            Welcome Back, <span className="text-emerald-600">{profile?.full_name?.split(' ')[0] || 'Coach'}</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Right: Clock In Widget & Actions */}
                    <div className="flex items-center gap-6 ml-auto">
                        <ClockInWidget />

                        <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8 relative">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="relative w-[80vw] max-w-sm bg-slate-900 h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-emerald-300 rounded-lg shadow-lg" />
                            <span className="font-bold text-lg text-white">Wild Robot</span>
                        </div>

                        <nav className="space-y-2">
                            {SIDEBAR_ITEMS.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                                        location.pathname.startsWith(item.path)
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "text-slate-400"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto border-t border-slate-800 pt-4">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 w-full">
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default CoachLayout;
