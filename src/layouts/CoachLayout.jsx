import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import SafeRoleSwitcher from '../components/SafeRoleSwitcher';
import CommandPalette from '../components/CommandPalette';
import MobileNav from '../components/MobileNav';

export default function CoachLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    const handleRoleSwitch = (role) => {
        localStorage.setItem('simulated_role', role);
        window.location.reload();
    };

    const rolesList = [
        { id: 'admin', label: 'Super Admin', color: 'bg-slate-900 text-white' },
        { id: 'manager', label: 'Activity Manager', color: 'bg-indigo-600 text-white' },
        { id: 'head_coach', label: 'Head Coach', color: 'bg-orange-600 text-white' },
        { id: 'hr', label: 'HR Manager', color: 'bg-pink-600 text-white' },
        { id: 'accountant', label: 'Accountant', color: 'bg-green-600 text-white' },
        { id: 'employee', label: 'Coach', color: 'bg-blue-600 text-white' },
        { id: 'freelance', label: 'Freelance', color: 'bg-purple-600 text-white' },
    ];

    // 🛡️ SECURITY: NO-TRUST POLICY
    // We strictly derive the role. We DO NOT trust localStorage unless the user is confirmed as Admin.
    const realRole = userProfile?.role || 'employee'; // Default to lowest privilege until loaded
    const isSuperAdmin = realRole === 'admin' || realRole === 'super_admin';

    // Only Admins can simulate other roles. Everyone else is locked to their real role.
    const currentRole = isSuperAdmin
        ? (localStorage.getItem('simulated_role') || realRole)
        : realRole;

    // Helper to get Role Badge & Greeting
    const getRoleDetails = (role) => {
        switch (role) {
            case 'admin': return { label: 'Commander', color: 'bg-slate-900 text-white', greeting: 'Commander' };
            case 'manager': return { label: 'Growth Hacker', color: 'bg-indigo-600 text-white', greeting: 'Growth Hacker' };
            case 'head_coach': return { label: 'Technical Director', color: 'bg-orange-600 text-white', greeting: 'Technical Director' };
            case 'hr': return { label: 'People Champion', color: 'bg-pink-600 text-white', greeting: 'People Champion' };
            case 'accountant': return { label: 'Finance Manager', color: 'bg-green-600 text-white', greeting: 'Finance Manager' };
            case 'employee': return { label: 'Coach', color: 'bg-blue-600 text-white', greeting: 'Coach' };
            case 'freelance': return { label: 'Partner', color: 'bg-purple-600 text-white', greeting: 'Partner' };
            default: return { label: 'User', color: 'bg-slate-400 text-white', greeting: 'User' };
        }
    };

    const roleDetails = getRoleDetails(currentRole);

    // Fetch User Profile
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setUserProfile(data);
                }
            }
        };
        fetchProfile();
    }, []);

    const allNavItems = [
        // 1. Operations
        { id: 'dashboard', name: 'Field Ops', path: '/coach/home', icon: 'dashboard', roles: ['admin', 'manager', 'head_coach', 'hr', 'accountant', 'employee', 'freelance', 'sales_admin'] },
        { id: 'schedule', name: 'My Schedule', path: '/coach/schedule', icon: 'calendar_today', roles: ['admin', 'head_coach', 'employee', 'freelance', 'sales_admin'] },

        // 2. People
        { id: 'roster', name: 'My Athletes', path: '/coach/roster', icon: 'directions_run', roles: ['admin', 'manager', 'head_coach', 'employee', 'freelance', 'sales_admin'] },
        { id: 'skills', name: 'Assessments', path: '/coach/skills', icon: 'assignment_turned_in', roles: ['admin', 'head_coach', 'employee', 'freelance'] },
        { id: 'staff', name: 'Staff & HR', path: '/coach/staff', icon: 'badge', roles: ['admin', 'hr'] },

        // 3. Business
        { id: 'analytics', name: 'Intel', path: '/coach/analytics', icon: 'analytics', roles: ['admin', 'manager'] },
        { id: 'finance', name: 'Treasury', path: '/coach/finance', icon: 'account_balance', roles: ['admin', 'accountant'] },
        { id: 'payments', name: 'Terminal', path: '/coach/payments', icon: 'point_of_sale', roles: ['admin', 'freelance', 'sales_admin'] },
        { id: 'earnings', name: 'My Pay', path: '/coach/earnings', icon: 'monetization_on', roles: ['employee', 'freelance', 'head_coach'] },

        // Utility (Not displayed in hubs directly, maybe bottom?)
        { id: 'settings', name: 'Settings', path: '/coach/settings', icon: 'settings', roles: ['admin', 'manager'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    // Format Data
    const memberSince = userProfile?.created_at
        ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : "2024";

    const userInitials = userProfile?.full_name
        ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : "WR";

    const userName = userProfile?.full_name || "Staff Member";

    return (
        <div className="min-h-screen bg-slate-50 md:flex font-inter">
            {/* Mobile Header (Brand Only, No Hamburger) */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
                <span className="font-black text-xl tracking-tight text-emerald-400">WR | Wild Robot</span>
                <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/50">
                    {userInitials}
                </div>
            </div>

            {/* Sidebar - Desktop Only (hidden on small screens) */}
            <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-white h-screen sticky top-0 shrink-0 border-r border-slate-800 z-40 overflow-y-auto">
                <div className="p-6">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
                        </div>
                        <div>
                            <h1 className="font-black text-lg leading-tight tracking-tight text-white">WR | Wild Robot</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise OS</p>
                        </div>
                    </div>

                    <nav className="space-y-6">
                        {/* 1. OPERATIONS HUB - The core daily driver */}
                        <div>
                            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Operations</p>
                            <div className="space-y-1">
                                {navItems.filter(i => ['dashboard', 'schedule', 'attendance'].includes(i.id)).map(item => <SidebarItem key={item.path} item={item} />)}
                            </div>
                        </div>

                        {/* 2. PEOPLE HUB - Athletes & Staff */}
                        <div>
                            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">People</p>
                            <div className="space-y-1">
                                {navItems.filter(i => ['roster', 'staff', 'skills'].includes(i.id)).map(item => <SidebarItem key={item.path} item={item} />)}
                            </div>
                        </div>

                        {/* 3. BUSINESS HUB - Money & Growth */}
                        <div>
                            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Business</p>
                            <div className="space-y-1">
                                {navItems.filter(i => ['analytics', 'finance', 'earnings', 'payments'].includes(i.id)).map(item => <SidebarItem key={item.path} item={item} />)}
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-white/5 bg-slate-900/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2 font-bold text-sm group"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-180 transition-transform">logout</span>
                        Sign Out
                    </button>
                    <p className="text-[10px] text-slate-600 mt-6 text-center font-mono">v3.2.0 | MOBILE FIRST</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 pb-20 md:pb-0">
                {/* Header (Desktop) - Glassmorphism */}
                <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 px-8 items-center justify-between shrink-0 z-20 sticky top-0">
                    <div className="flex items-center gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-0.5">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                    Welcome, <span className="text-emerald-600">{userName.split(' ')[0]}</span>
                                </h2>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Dynamic Stats Strip */}
                        <div className="hidden xl:flex items-center gap-3 pl-8 border-l border-slate-200 h-10">
                            {currentRole === 'admin' && (
                                <>
                                    <MetricPill icon="group" label="Staff" value="24" color="text-blue-600" bg="bg-blue-50" />
                                    <MetricPill icon="domain" label="Branches" value="3" color="text-purple-600" bg="bg-purple-50" />
                                    <MetricPill icon="trending_up" label="Revenue" value="+15%" color="text-emerald-600" bg="bg-emerald-50" />
                                </>
                            )}
                            {currentRole === 'manager' && (
                                <>
                                    <MetricPill icon="how_to_reg" label="Signups Today" value="12" color="text-emerald-600" bg="bg-emerald-50" />
                                    <MetricPill icon="person_remove" label="Churn" value="2%" color="text-red-600" bg="bg-red-50" />
                                </>
                            )}
                            {currentRole === 'accountant' && (
                                <>
                                    <MetricPill icon="receipt_long" label="Pending Inv" value="8" color="text-amber-600" bg="bg-amber-50" />
                                    <MetricPill icon="account_balance" label="Cashflow" value="OK" color="text-emerald-600" bg="bg-emerald-50" />
                                </>
                            )}
                            {['head_coach', 'employee', 'freelance'].includes(currentRole) && (
                                <>
                                    <MetricPill icon="sports_gymnastics" label="Athletes" value="115" color="text-blue-600" bg="bg-blue-50" />
                                    <MetricPill icon="timer" label="Hours" value="82" color="text-amber-600" bg="bg-amber-50" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Role Switcher - ADMIN ONLY */}
                        {isSuperAdmin && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                                    className={clsx(
                                        "text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer border shadow-sm",
                                        roleDetails.color,
                                        "border-white/20"
                                    )}
                                >
                                    {roleDetails.label}
                                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {isRoleMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsRoleMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.1 }}
                                                className="absolute top-full right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 z-50 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-slate-100/50 bg-slate-50/50">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400">Select Role Context</p>
                                                </div>
                                                <div className="max-h-72 overflow-y-auto p-2">
                                                    {rolesList.map(role => (
                                                        <button
                                                            key={role.id}
                                                            onClick={() => handleRoleSwitch(role.id)}
                                                            className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-xl flex items-center gap-3 transition-colors group"
                                                        >
                                                            <div className={clsx("h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm", role.color.split(' ')[0])} />
                                                            <span className={clsx("text-xs font-bold group-hover:text-slate-900 transition-colors", currentRole === role.id ? "text-slate-900" : "text-slate-500")}>
                                                                {role.label}
                                                            </span>
                                                            {currentRole === role.id && (
                                                                <span className="material-symbols-outlined text-sm text-emerald-500 ml-auto font-bold">check</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Notification Bell */}
                        <button className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all relative shadow-sm">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* User Profile Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-3 focus:outline-none pl-2 group"
                            >
                                <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-100 group-hover:ring-emerald-500 transition-all overflow-hidden">
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        userInitials
                                    )}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-black text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">{userName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Member since {memberSince}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 text-sm group-hover:text-emerald-500 transition-colors">expand_more</span>
                            </button>

                            {/* Blur Dropdown Menu */}
                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[60]" onClick={() => setIsProfileMenuOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                                            className="absolute top-[calc(100%+12px)] right-0 w-72 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 z-[70] overflow-hidden"
                                        >
                                            <div className="p-6 border-b border-slate-100/50 bg-gradient-to-b from-slate-50/50 to-transparent">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-lg ring-4 ring-white">
                                                        {userProfile?.avatar_url ? (
                                                            <img src={userProfile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                                        ) : (
                                                            userInitials
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg">{userName}</p>
                                                        <p className="text-xs font-medium text-emerald-600">{roleDetails.label}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { navigate('/coach/profile'); setIsProfileMenuOpen(false); }}
                                                    className="w-full text-center text-xs font-bold uppercase tracking-wider text-white bg-slate-900 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                                >
                                                    View Personal Profile
                                                </button>
                                            </div>

                                            <div className="p-3 space-y-1">
                                                <MenuLink icon="settings" label="System Settings" onClick={() => { navigate('/coach/settings'); setIsProfileMenuOpen(false); }} />
                                                <MenuLink icon="help" label="Help & Support" onClick={() => alert('Support')} />
                                                <MenuLink icon="lock" label="Lock Screen" onClick={() => alert('Locked')} />
                                            </div>

                                            <div className="p-3 border-t border-slate-100/50">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-4 md:p-8 z-10 scroll-smooth">
                    <Outlet context={{ userProfile }} />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav />

            {/* Global Role Switcher - ADMIN ONLY */}
            {isSuperAdmin && <SafeRoleSwitcher />}

            <CommandPalette />
        </div>
    );
}

// Helper Components
function MenuLink({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
        >
            <span className="material-symbols-outlined text-[20px] text-slate-400">{icon}</span>
            {label}
        </button>
    );
}

// Helper for Header Stats
function MetricPill({ icon, label, value, color, bg }) {
    return (
        <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-default", bg)}>
            <span className={clsx("material-symbols-outlined text-[18px]", color)}>{icon}</span>
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
                <p className={clsx("text-xs font-black leading-none", color)}>{value}</p>
            </div>
        </div>
    );
}

function SidebarItem({ item }) {
    return (
        <NavLink
            to={item.path}
            className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-bold text-[13px]",
                isActive
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
        >
            <span className={clsx("material-symbols-outlined text-[20px]")}>
                {item.icon}
            </span>
            {item.name}
        </NavLink>
    );
}
