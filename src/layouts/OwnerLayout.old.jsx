import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    LayoutDashboard, Users, Wallet, Dumbbell,
    Settings, LogOut, Shield, Crown, ChevronUp, Bell, Menu, Calendar
} from 'lucide-react';
import SidebarUserItem from '../components/dashboard/SidebarUserItem';

const OwnerLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Mock Data for now, will link to real count later
    const athleteCount = 0;

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch Profile -> Academy -> Plan
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*, academies(*, current_plan:subscription_plans(*))')
                    .eq('id', user.id)
                    .single();

                if (profile?.academies) {
                    setSubscription({
                        plan: profile.academies.current_plan,
                        academyName: profile.academies.name,
                        maxAthletes: profile.academies.current_plan?.max_athletes || Infinity,
                        status: profile.academies.subscription_status
                    });
                }
            } catch (error) {
                console.error("Subscription fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-all group
                ${isActive
                    ? 'bg-blue-900/20 text-blue-400 border-l-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white border-l-2 border-transparent'}
            `}
        >
            <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            {isSidebarOpen && <span>{label}</span>}
        </NavLink>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* SIDEBAR */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-slate-950 border-r border-slate-800 text-slate-400 flex flex-col transition-all duration-300 fixed h-full z-50`}>
                {/* Branding */}
                <div className="h-16 flex items-center px-4 border-b border-slate-800/50">
                    <Shield className="w-6 h-6 text-emerald-500 shrink-0" />
                    {isSidebarOpen && (
                        <div className="ml-3">
                            <h1 className="font-bold text-white text-sm tracking-wider leading-tight">WILD ROBOT</h1>
                            <p className="text-[10px] text-slate-500 font-mono">COMMAND CENTER</p>
                        </div>
                    )}
                </div>

                {/* NAVIGATION */}
                <div className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Operations Group */}
                    <div className="mb-6">
                        {isSidebarOpen && <p className="text-[10px] font-bold text-slate-600 uppercase px-3 mb-2 tracking-wider">Operations</p>}
                        <NavItem to="/owner/dashboard" icon={LayoutDashboard} label="Live Feed" />
                        <NavItem to="/owner/staff" icon={Users} label="Staff & Units" />
                        <NavItem to="/owner/finance" icon={Wallet} label="Treasury" />
                        <NavItem to="/owner/athletes" icon={Dumbbell} label="Heroes Roster" />
                        <NavItem to="/owner/schedule" icon={Calendar} label="Schedule" />
                    </div>

                    {/* System Group */}
                    <div>
                        {isSidebarOpen && <p className="text-[10px] font-bold text-slate-600 uppercase px-3 mb-2 tracking-wider">System</p>}
                        <NavItem to="/owner/settings" icon={Settings} label="Configuration" />
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:bg-red-900/10 hover:text-red-400 transition-colors text-left group"
                        >
                            <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            {isSidebarOpen && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>

                {/* SUBSCRIPTION WIDGET (Compact) */}
                {isSidebarOpen && subscription && (
                    <div className="mx-3 mb-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-500" />
                                {subscription.plan?.name || 'TRAIL'}
                            </span>
                            <span className="text-[10px] text-emerald-500 font-mono">Active</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-blue-600 rounded-full w-1/3"></div>
                        </div>
                        <button className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 rounded transition-colors">
                            Upgrade Plan
                        </button>
                    </div>
                )}

                {/* USER WIDGET (New Bottom Component) */}
                {isSidebarOpen ? (
                    <SidebarUserItem />
                ) : (
                    <div className="mt-auto p-4 border-t border-slate-800 flex justify-center cursor-pointer hover:bg-slate-900 transition-colors" onClick={() => navigate('/owner/profile')}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white border border-slate-700 font-bold text-xs">
                            O
                        </div>
                    </div>
                )}
            </aside>

            {/* MAIN CONTENT */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
                {/* Header (Simplified - User moved to sidebar) */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            {subscription?.academyName || 'Dashboard'}
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-400 border border-slate-200 uppercase tracking-wide">
                                v2.0 Live
                            </span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-slate-100 rounded-full relative transition-colors">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto animate-fade-in"><Outlet /></div>
            </main>
        </div>
    );
};

export default OwnerLayout;
