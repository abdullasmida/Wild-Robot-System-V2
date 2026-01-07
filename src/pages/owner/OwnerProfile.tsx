import React, { useEffect, useState } from 'react';
import { User, Mail, MapPin, Globe, ShieldCheck, Edit3, Camera, LogOut, Activity, Database, Clock, Key } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Profile } from '@/types/custom';

export default function OwnerProfile() {
    const navigate = useNavigate();
    const { user, signOut, loading: authLoading, checkSession } = useAuthStore();
    const [localLoading, setLocalLoading] = useState(true);

    // Initial check to ensure we have the latest user data
    useEffect(() => {
        const init = async () => {
            if (!user) {
                await checkSession();
            }
            setLocalLoading(false);
        }
        init();
    }, [checkSession, user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Sign out failed", error);
            navigate('/login'); // Force redirect anyway
        }
    };

    // ...

    {/* Action Buttons (Right Side) */ }
    <div className="absolute bottom-4 right-4 md:right-6 flex gap-3 z-20">
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-lg">
            <Edit3 size={16} /> <span className="hidden md:inline">Edit Profile</span>
        </button>
        <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-lg">
            <LogOut size={16} /> <span className="hidden md:inline">Sign Out</span>
        </button>
    </div>
            </div >

        {/* 2. Content Grid (Bento Style) */ }
        < div className = "max-w-5xl mx-auto pt-16 md:pt-10 grid grid-cols-1 md:grid-cols-3 gap-6" >

            {/* Left Column: Personal Details */ }
            < div className = "md:col-span-1 space-y-6" >
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">About</h3>
                    <div className="space-y-4 text-slate-400">
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-blue-500" />
                            <span>{'Headquarters'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-blue-500" />
                            <span className="truncate text-sm">{profile?.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Globe size={18} className="text-blue-500" />
                            <span className="text-sm">Wild Robot System</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-slate-500 mb-2">Bio</h4>
                        <p className="text-sm leading-relaxed text-slate-300 italic">
                            {"Commanding the digital infrastructure of the academy."}
                        </p>
                    </div>
                </div>
                </div >

        {/* Right Column: System Status & Quick Stats */ }
        < div className = "md:col-span-2 space-y-6" >

            {/* Security & Role Card */ }
            < div className = "bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex justify-between items-center group hover:border-blue-900/50 transition" >
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Security Level: <span className="text-green-400">Maximum</span>
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Root access granted. Neural connection stable.</p>
                        </div>
                        <div className="h-12 w-12 bg-green-900/20 rounded-full flex items-center justify-center border border-green-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <ShieldCheck className="text-green-500" size={24} />
                        </div>
                    </div >

        {/* Responsibility Grid */ }
        < div className = "grid grid-cols-2 gap-4" >
                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
                                <Activity size={40} />
                            </div>
                            <h4 className="text-slate-400 text-sm font-medium">System Status</h4>
                            <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">Operational ✅</p>
                        </div>
                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
                                <Database size={40} />
                            </div>
                            <h4 className="text-slate-400 text-sm font-medium">Database Health</h4>
                            <p className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">Healthy 📊</p>
                        </div>
                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-purple-500/50 transition cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
                                <Clock size={40} />
                            </div>
                            <h4 className="text-slate-400 text-sm font-medium">Next Backup</h4>
                            <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">02:00 AM 🕒</p>
                        </div>
                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-yellow-500/50 transition cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
                                <Key size={40} />
                            </div>
                            <h4 className="text-slate-400 text-sm font-medium">Admin Access</h4>
                            <p className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Full Control 🔑</p>
                        </div>
                    </div >

                </div >
            </div >
        </div >
    );
}
