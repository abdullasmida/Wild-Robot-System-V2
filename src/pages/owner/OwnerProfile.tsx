import React, { useEffect, useState } from 'react';
import { User, Mail, MapPin, Globe, ShieldCheck, Edit3, Camera, LogOut, Activity, Database, Clock, Key } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Profile } from '@/types/custom'; // Assuming this type exists, otherwise we might need to define it locally or use 'any' temporarily
import { supabase } from '@/supabaseClient';

export default function OwnerProfile() {
    const navigate = useNavigate();
    const { user, signOut, loading: authLoading, checkSession } = useAuthStore();
    const [profile, setProfile] = useState<any>(null); // Using any for flexibility with Supabase response
    const [loading, setLoading] = useState(true);

    // Initial check to ensure we have the latest user data
    useEffect(() => {
        const init = async () => {
            // If auth store is loading, wait
            if (authLoading) return;

            if (!user) {
                await checkSession();
            }

            // Fetch detailed profile from Supabase
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (currentUser) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select(`
                            id, 
                            first_name, 
                            last_name, 
                            email, 
                            bio, 
                            location, 
                            avatar_url,
                            academy:academies(name)
                        `)
                        .eq('id', currentUser.id)
                        .single();

                    if (error) throw error;
                    setProfile(data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [checkSession, user, authLoading]);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Sign out failed", error);
            navigate('/login'); // Force redirect anyway
        }
    };

    if (loading || authLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading Profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 animate-in fade-in duration-500">

            {/* 1. Header Section: The Identity */}
            <div className="max-w-5xl mx-auto relative mb-12">
                {/* Cover Image */}
                <div className="h-48 w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Profile Card Overlay */}
                <div className="absolute -bottom-16 left-4 md:left-10 flex items-end space-x-6">
                    <div className="relative group">
                        {/* Avatar with White Border */}
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl relative ring-1 ring-slate-100">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Owner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                    <User size={48} />
                                </div>
                            )}
                        </div>
                        {/* Edit Photo Button */}
                        <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 hover:text-emerald-600 transition text-slate-400 shadow-sm">
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="pb-2 md:pb-4">
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-900">
                            {profile?.first_name || 'Owner'} {profile?.last_name}
                            {/* Verification Badge */}
                            <span title="Verified Owner" className="text-emerald-500 bg-emerald-50 rounded-full p-0.5">
                                <ShieldCheck size={20} fill="currentColor" className="text-emerald-500" />
                            </span>
                        </h1>
                        <p className="text-slate-500 font-medium text-base md:text-lg flex items-center gap-2 mt-1">
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs md:text-sm font-bold uppercase tracking-wider">
                                Academy Owner
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm md:text-base">{profile?.email}</span>
                        </p>
                    </div>
                </div>

                {/* Action Buttons (Right Side) */}
                <div className="absolute -bottom-14 md:bottom-4 right-0 md:right-6 flex gap-3 z-10">
                    <button className="hidden md:flex px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg items-center gap-2 transition text-sm font-bold shadow-sm hover:shadow active:scale-95">
                        <Edit3 size={16} /> <span>Edit Profile</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-white hover:bg-red-50 border border-slate-200 text-slate-500 hover:text-red-600 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-sm hover:shadow active:scale-95 group">
                        <LogOut size={16} className="group-hover:text-red-500" /> <span className="hidden md:inline">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* 2. Content Grid (Bento Style) */}
            <div className="max-w-5xl mx-auto pt-20 md:pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Personal Details */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Contact Info</h3>
                        <div className="space-y-4 text-slate-600">
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
                                    <MapPin size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <span className="text-sm font-medium">{profile?.location || 'Headquarters'}</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
                                    <Mail size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <span className="text-sm font-medium truncate" title={profile?.email}>{profile?.email || user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
                                    <Globe size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <span className="text-sm font-medium">Wild Robot System</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Bio</h4>
                            <p className="text-sm leading-relaxed text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                                "{profile?.bio || "Managing the academy's operations and success."}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: System Status & Quick Stats */}
                <div className="md:col-span-2 space-y-6">

                    {/* Academy Status Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-200 hover:shadow-md transition-all group">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Subscription Status
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">Your academy is running on the <span className="font-semibold text-emerald-600">Enterprise Plan</span>.</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-bold text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                        </div>
                    </div>

                    {/* Responsibility Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Activity size={60} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">System Health</h4>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">99.9%</p>
                                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Stable</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Database size={60} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Database Usage</h4>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">12%</p>
                                    <span className="text-xs text-slate-400">of 10GB</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Clock size={60} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Next Backup</h4>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">02:00 AM</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Key size={60} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Admin Access</h4>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors">Super Admin</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
