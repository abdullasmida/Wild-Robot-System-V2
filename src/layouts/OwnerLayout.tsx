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
    LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Imports for Modals
import UniversalAddModal from '../components/modals/UniversalAddModal';
import CreateAcademyModal from '../components/modals/CreateAcademyModal';
import NewShiftModal from '../components/modals/NewShiftModal';
import RecruitHeroesModal from '../components/modals/RecruitHeroesModal';
import NotificationsDrawer from '../components/notifications/NotificationsDrawer';
import SidebarUserItem from '../components/dashboard/SidebarUserItem';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';

// ... (other imports)

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const SIDEBAR_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/owner/dashboard' },
    { label: 'Schedule', icon: CalendarDays, path: '/owner/schedule' },
    { label: 'Live Feed', icon: Activity, path: '/owner/feed' },
    { label: 'Team Directory', icon: Contact, path: '/owner/staff' },
    { label: 'Heroes', icon: Trophy, path: '/owner/athletes' },
    { label: 'Treasury', icon: Wallet, path: '/owner/treasury' },
    { label: 'Settings', icon: Settings, path: '/owner/settings' },
];
const OwnerLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('Main Academy');

    // Modal States
    const [isUniversalModalOpen, setIsUniversalModalOpen] = useState(false);
    const [universalModalTab, setUniversalModalTab] = useState(0); // 0 = Staff (Manual), 1 = Import... Logic adjusted in Modal

    const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

    // Notification State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Breadcrumbs logic (Simple)
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Handlers
    const openUniversalModal = (tabIndex: number) => {
        setIsQuickActionOpen(false);
        setUniversalModalTab(tabIndex);
        setIsUniversalModalOpen(true);
    };

    const { user, checkSession } = useAuthStore(); // Get user & session refresher
    const { viewMode } = useAppStore();
    const academy = user?.academy; // Derive academy from user profile

    // Force Academy Setup for new Owners
    const [isAcademySetupOpen, setIsAcademySetupOpen] = useState(false);

    React.useEffect(() => {
        if (user?.role === 'owner' && !user?.academy_id) {
            setIsAcademySetupOpen(true);
        }
    }, [user]);

    const handleAcademyCreated = async () => {
        await checkSession(); // Refresh profile to get the new academy_id
        setIsAcademySetupOpen(false);
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30">

            {/* Modals Layer */}
            <CreateAcademyModal
                isOpen={isAcademySetupOpen}
                onClose={() => { /* Prevent closing if required, or allow generic close */ }}
                onSuccess={handleAcademyCreated}
            />
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

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white z-30">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <Link to="/owner/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg mr-3 shadow-lg shadow-emerald-500/20" />
                        <span className="font-bold text-lg tracking-tight text-slate-900">Wild Robot</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {SIDEBAR_ITEMS.filter(item => {
                        if (viewMode === 'floor') {
                            // In Floor Mode, hide admin-heavy items
                            return ['Dashboard', 'Schedule', 'Live Feed', 'Heroes'].includes(item.label);
                        }
                        return true;
                    }).map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group relative overflow-hidden",
                                    // Base Transition
                                    "transition-all duration-200",
                                    // Active State
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

                    {/* Sign Out Button */}
                    <button
                        onClick={async () => {
                            await useAuthStore.getState().signOut();
                            window.location.href = '/login';
                        }}
                        className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group relative overflow-hidden mt-4",
                            "border-l-4 border-transparent text-slate-500 hover:text-red-600 hover:bg-red-50 hover:translate-x-1 transition-all duration-200"
                        )}
                    >
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors relative z-10" />
                        <span className="relative z-10">Sign Out</span>
                    </button>
                </nav>

                {/* User Profile Stub */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <SidebarUserItem />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Top Bar (Sticky, Glass) */}
                <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-20 sticky top-0">

                    {/* Left: Mobile Toggle & Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Breadcrumbs */}
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                            {pathSegments.map((segment, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
                                    <span className={cn("capitalize", index === pathSegments.length - 1 && "text-slate-900 font-medium")}>
                                        {segment}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Center: Branch Selector */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 hidden md:block">
                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50/50 hover:bg-white transition-all text-sm font-medium hover:border-slate-300 group shadow-sm hover:shadow">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-slate-700">{academy?.name || 'My Academy'}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
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
                        </div>

                        {/* Quick Action FAB & Dropdown */}
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

                            {/* Dropdown Menu */}
                            {isQuickActionOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsQuickActionOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="p-1">
                                            <button
                                                onClick={() => {
                                                    setIsQuickActionOpen(false);
                                                    setIsAthleteModalOpen(true);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium"
                                            >
                                                <Shield className="w-4 h-4 text-blue-500" />
                                                Add Athlete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsQuickActionOpen(false);
                                                    openUniversalModal(0);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium"
                                            >
                                                <UserPlus className="w-4 h-4 text-emerald-500" />
                                                Add Staff
                                            </button>
                                            <button
                                                onClick={() => { setIsQuickActionOpen(false); setIsShiftModalOpen(true); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium"
                                            >
                                                <CalendarPlus className="w-4 h-4 text-purple-500" />
                                                New Shift
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-slate-50 relative p-6">
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
                    <aside className="relative w-[80vw] max-w-sm bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg" />
                                <span className="font-bold text-lg text-slate-900">Wild Robot</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900"><Plus className="w-6 h-6 rotate-45" /></button>
                        </div>

                        <nav className="space-y-1">
                            {SIDEBAR_ITEMS.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                                        location.pathname === item.path ? "bg-emerald-50 text-emerald-600" : "text-slate-500"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default OwnerLayout;
