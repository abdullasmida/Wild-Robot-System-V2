import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
    const role = localStorage.getItem('simulated_role') || 'admin';
    const [activeTab, setActiveTab] = useState('personal');
    const { userProfile } = useOutletContext() || {};

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: 'person' },
        { id: 'security', label: 'Security', icon: 'lock' },
        ...(role === 'admin' ? [{ id: 'system', label: 'System Control', icon: 'admin_panel_settings' }] : []),
    ];

    const userName = userProfile?.full_name || "Coach Sarah";
    const userRole = userProfile?.coach_type ? userProfile.coach_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : (role === 'admin' ? 'Super Administrator' : 'Head Gymnastics Coach');
    const userInitials = userProfile?.full_name
        ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : "CS";

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* 1. Hero Banner Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-8 relative z-10">
                        <div className="flex items-end gap-6">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-2xl bg-white p-1 shadow-2xl ring-4 ring-white/10 translate-y-1/2">
                                    <div className="h-full w-full rounded-xl bg-slate-800 flex items-center justify-center text-white text-3xl font-black overflow-hidden">
                                        {userProfile?.avatar_url ? (
                                            <img src={userProfile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            userInitials
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-[-10px] right-[-10px] bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                                    <span className="material-symbols-outlined text-[16px] block">verified</span>
                                </div>
                            </div>
                            <div className="mb-2 text-white/90">
                                <h1 className="text-3xl font-black tracking-tight text-white">{userName}</h1>
                                <p className="text-emerald-400 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                    {userRole}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs (Integrated in Hero) */}
                <div className="max-w-7xl mx-auto px-6 pt-20 pb-0">
                    <div className="flex items-center gap-8 border-b border-slate-100">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all",
                                    activeTab === tab.id
                                        ? "text-emerald-600 border-emerald-500"
                                        : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-200"
                                )}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* 2. Achievement Cards (Persistent) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KPICard
                        label="Active Athletes"
                        value="115"
                        trend="+12%"
                        icon="sports_gymnastics"
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <KPICard
                        label="Hours This Month"
                        value="82h"
                        trend="On Track"
                        icon="timer"
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                    <KPICard
                        label="Total Revenue"
                        value="AED 45k"
                        trend="+8%"
                        icon="payments"
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                </div>

                {/* 3. Tab Content (Animated) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 min-h-[400px] relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'personal' && <PersonalInfoTab />}
                            {activeTab === 'security' && <SecurityTab />}
                            {activeTab === 'system' && <SystemTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// --- Components ---

function KPICard({ label, value, trend, icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                    <span className="text-[10px] font-bold bg-slate-50 px-2 py-0.5 rounded text-slate-500">{trend}</span>
                </div>
            </div>
            <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", bg)}>
                <span className={clsx("material-symbols-outlined text-2xl", color)}>{icon}</span>
            </div>
        </div>
    );
}

function PersonalInfoTab() {
    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
                <p className="text-slate-500 text-sm">Manage your coach profile details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" defaultValue="Coach Sarah" />
                <InputGroup label="Email Address" defaultValue="sarah.c@wildrobot.com" />
                <InputGroup label="Phone Number" defaultValue="+971 55 123 4567" />
                <InputGroup label="Designation" defaultValue="Head Coach" disabled />
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-900">Bio / Expertise</h3>
                <textarea
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                    defaultValue="Specialized in Artistic Gymnastics with over 8 years of experience coaching competitive squads."
                />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function SecurityTab() {
    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900">Security & Login</h2>
                <p className="text-slate-500 text-sm">Protect your account.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                        <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Currently disabled.</p>
                    </div>
                </div>
                <button className="text-emerald-600 font-bold text-sm hover:underline">Enable</button>
            </div>

            <div className="space-y-4">
                <InputGroup label="Current Password" type="password" />
                <InputGroup label="New Password" type="password" />
                <InputGroup label="Confirm New Password" type="password" />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button className="bg-white border-2 border-slate-200 text-slate-600 px-8 py-3 rounded-xl font-bold text-sm hover:border-slate-300 transition-all">
                    Update Password
                </button>
            </div>
        </div>
    );
}

function SystemTab() {
    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">admin_panel_settings</span>
                    System Control
                </h2>
                <p className="text-slate-500 text-sm">Global configurations for the workspace.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-emerald-500 mb-4">domain</span>
                    <h3 className="font-bold text-slate-900">Branch Management</h3>
                    <p className="text-xs text-slate-500 mt-1">Add or remove locations.</p>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500 mb-4">group_add</span>
                    <h3 className="font-bold text-slate-900">User Roles</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage permissions.</p>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, defaultValue, type = "text", disabled = false }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                defaultValue={defaultValue}
                disabled={disabled}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
        </div>
    );
}
