import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    LayoutDashboard, Users, Wallet, Dumbbell,
    Settings, LogOut, UserCircle, Bell, Menu, Shield, Crown, ChevronUp
} from 'lucide-react';

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
        <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Icon className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">{label}</span>}
        </NavLink>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* SIDEBAR */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 fixed h-full z-50 shadow-2xl`}>
                {/* Branding */}
                <div className="h-20 flex items-center justify-center border-b border-slate-800">
                    <Shield className="w-8 h-8 text-emerald-400" />
                    {isSidebarOpen && <span className="ml-3 font-bold text-lg tracking-wider">WILD ROBOT</span>}
                </div>

                {/* OPERATIONS SECTION */}
                <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                    <p className={`text-xs font-bold text-slate-500 uppercase px-4 mb-2 ${!isSidebarOpen && 'hidden'}`}>Operations</p>
                    <NavItem to="/owner/dashboard" icon={LayoutDashboard} label="Live Feed" />
                    <NavItem to="/owner/staff" icon={Users} label="Staff & HR" />
                    <NavItem to="/owner/finance" icon={Wallet} label="Finance" />
                    <NavItem to="/owner/athletes" icon={Dumbbell} label="Roster" />
                </div>

                {/* SUBSCRIPTION WIDGET */}
                {isSidebarOpen && subscription && (
                    <div className="mx-4 mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-black text-slate-300 tracking-widest uppercase">
                                    {subscription.plan?.name || 'TRAIL'}
                                </span>
                            </div>
                            {subscription.status === 'past_due' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 mb-3">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>Athletes</span>
                                <span>{athleteCount} / {subscription.maxAthletes === Infinity ? '∞' : subscription.maxAthletes}</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((athleteCount / (subscription.maxAthletes || 100)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <button className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                            Upgrade Plan <ChevronUp className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* PROFILE SECTION (Bottom) */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <p className={`text-xs font-bold text-slate-500 uppercase px-4 mb-2 ${!isSidebarOpen && 'hidden'}`}>System</p>
                    <NavItem to="/owner/settings" icon={Settings} label="Settings" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-200 transition-all mt-2">
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg"><Menu className="w-6 h-6 text-slate-600" /></button>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900">The Commander</p>
                            <p className="text-xs text-emerald-600 font-bold">
                                {subscription?.academyName || 'Owner Account'}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-500">
                            <UserCircle className="w-6 h-6 text-emerald-700" />
                        </div>
                    </div>
                </header>
                <div className="p-8"><Outlet /></div>
            </main>
        </div>
    );
};

export default OwnerLayout;
