import React, { useState } from 'react';
import { clsx } from 'clsx';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function StudentSettings() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    // Mock User Data
    const [profile, setProfile] = useState({
        displayName: 'Super Student',
        email: 'parent@example.com',
        avatarId: 'wibo_classic',
        notifications: {
            email: true,
            whatsapp: false
        }
    });

    const wiboAvatars = [
        { id: 'wibo_classic', name: 'Wibo Classic', color: 'bg-emerald-500' },
        { id: 'wibo_gymnast', name: 'Wibo Gymnast', color: 'bg-blue-500' },
        { id: 'wibo_hero', name: 'Wibo Hero', color: 'bg-red-500' },
        { id: 'wibo_student', name: 'Wibo Student', color: 'bg-amber-500' },
        { id: 'wibo_ninja', name: 'Wibo Ninja', color: 'bg-slate-800' },
        { id: 'wibo_artist', name: 'Wibo Artist', color: 'bg-purple-500' },
    ];

    const currentAvatar = wiboAvatars.find(a => a.id === profile.avatarId) || wiboAvatars[0];

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            await supabase.auth.signOut();
            navigate('/');
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate save
        setTimeout(() => {
            setIsSaving(false);

            // Success Toast
            const toast = document.createElement('div');
            toast.textContent = 'Settings Saved! ✅';
            toast.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 font-bold z-[200]';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }, 1000);
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900">Settings & Profile</h1>
                <button
                    onClick={handleLogout}
                    className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                >
                    Log Out
                </button>
            </div>

            {/* Avatar Studio */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                    <div className={clsx(
                        "h-24 w-24 rounded-full flex items-center justify-center text-white text-3xl shadow-lg transition-transform group-hover:scale-105",
                        currentAvatar.color
                    )}>
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                        <span className="material-symbols-outlined text-white">edit</span>
                    </div>
                </div>

                <h2 className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Avatar</h2>
                <p className="font-bold text-slate-700">{currentAvatar.name}</p>

                <div className="w-full mt-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                    <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                </div>
            </section>

            {/* Account Security */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-slate-400">security</span>
                    <h3 className="font-black text-slate-800">Security</h3>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 pl-1">Contact support to change email.</p>
                </div>

                <button className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    Change Password
                </button>
            </section>

            {/* Preferences */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-slate-400">tune</span>
                    <h3 className="font-black text-slate-800">Preferences</h3>
                </div>

                <div className="flex items-center justify-between py-2">
                    <span className="font-medium text-slate-700">Email Notifications</span>
                    <button
                        onClick={() => setProfile({ ...profile, notifications: { ...profile.notifications, email: !profile.notifications.email } })}
                        className={clsx(
                            "w-12 h-7 rounded-full transition-colors relative",
                            profile.notifications.email ? "bg-emerald-500" : "bg-slate-200"
                        )}
                    >
                        <div className={clsx(
                            "h-5 w-5 bg-white rounded-full shadow-sm absolute top-1 transition-all",
                            profile.notifications.email ? "left-6" : "left-1"
                        )} />
                    </button>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-50">
                    <span className="font-medium text-slate-700">WhatsApp Updates</span>
                    <button
                        onClick={() => setProfile({ ...profile, notifications: { ...profile.notifications, whatsapp: !profile.notifications.whatsapp } })}
                        className={clsx(
                            "w-12 h-7 rounded-full transition-colors relative",
                            profile.notifications.whatsapp ? "bg-emerald-500" : "bg-slate-200"
                        )}
                    >
                        <div className={clsx(
                            "h-5 w-5 bg-white rounded-full shadow-sm absolute top-1 transition-all",
                            profile.notifications.whatsapp ? "left-6" : "left-1"
                        )} />
                    </button>
                </div>
            </section>

            {/* Save Button */}
            <div className="sticky bottom-4 z-10">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>

            {/* Avatar Selection Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAvatarModal(false)}>
                    <div
                        className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-black text-slate-900">Choose Your Wibo</h2>
                            <p className="text-slate-500 text-sm">Pick a style that matches your vibe!</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {wiboAvatars.map(avatar => (
                                <button
                                    key={avatar.id}
                                    onClick={() => {
                                        setProfile({ ...profile, avatarId: avatar.id });
                                        setShowAvatarModal(false);
                                    }}
                                    className={clsx(
                                        "aspect-square rounded-2xl flex flex-col items-center justify-center transition-all p-2 border-2",
                                        profile.avatarId === avatar.id
                                            ? "border-blue-500 bg-blue-50 scale-105 shadow-md"
                                            : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                                    )}
                                >
                                    <div className={clsx("h-12 w-12 rounded-full flex items-center justify-center text-white mb-2 shadow-sm", avatar.color)}>
                                        <span className="material-symbols-outlined">smart_toy</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{avatar.name}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowAvatarModal(false)}
                            className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
