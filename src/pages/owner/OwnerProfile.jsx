import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { User, Mail, MapPin, Globe, ShieldCheck, Edit3, Camera, LogOut, Activity, Database, Clock, Key } from 'lucide-react';

export default function OwnerProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Owner Profile
    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        }
        getProfile();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-white font-mono animate-pulse">Loading Command Center...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 animate-fade-in">

            {/* 1. Header Section: The Identity */}
            <div className="max-w-5xl mx-auto relative mb-12">
                {/* Cover Image */}
                <div className="h-48 w-full bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-black"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>

                {/* Profile Card Overlay */}
                <div className="absolute -bottom-16 left-4 md:left-10 flex items-end space-x-6">
                    <div className="relative group">
                        {/* Avatar with Gold Border */}
                        <div className="w-32 h-32 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden shadow-xl relative">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Owner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-3xl font-bold uppercase">
                                    {profile?.first_name?.[0] || 'O'}
                                </div>
                            )}
                        </div>
                        {/* Edit Photo Button */}
                        <button className="absolute bottom-2 right-2 p-2 bg-slate-900 rounded-full border border-slate-700 hover:bg-blue-600 transition text-white">
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="pb-4">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
                            {profile?.first_name} {profile?.last_name}
                            {/* Always show verification badge for Owner */}
                            <span title="Verified Owner" className="text-yellow-400">
                                <ShieldCheck size={24} fill="currentColor" className="text-yellow-500" />
                            </span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-900/50 border border-blue-700 text-blue-200 text-sm">
                                The Owner
                            </span>
                            • {profile?.email}
                        </p>
                    </div>
                </div>

                {/* Action Buttons (Right Side) */}
                <div className="absolute bottom-4 right-4 md:right-6 flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-lg">
                        <Edit3 size={16} /> <span className="hidden md:inline">Edit Profile</span>
                    </button>
                    <button className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-lg">
                        <LogOut size={16} /> <span className="hidden md:inline">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* 2. Content Grid (Bento Style) */}
            <div className="max-w-5xl mx-auto pt-16 md:pt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Personal Details */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">About</h3>
                        <div className="space-y-4 text-slate-400">
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-blue-500" />
                                <span>{profile?.location || 'Headquarters'}</span>
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
                                {profile?.bio || "Commanding the digital infrastructure of the academy."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: System Status & Quick Stats */}
                <div className="md:col-span-2 space-y-6">

                    {/* Security & Role Card */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex justify-between items-center group hover:border-blue-900/50 transition">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Security Level: <span className="text-green-400">Maximum</span>
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Root access granted. Neural connection stable.</p>
                        </div>
                        <div className="h-12 w-12 bg-green-900/20 rounded-full flex items-center justify-center border border-green-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <ShieldCheck className="text-green-500" size={24} />
                        </div>
                    </div>

                    {/* Responsibility Grid */}
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                </div>
            </div>
        </div>
    );
}
