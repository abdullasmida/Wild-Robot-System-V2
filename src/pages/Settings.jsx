import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

export default function Settings() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    console.log("Current Theme Context:", theme);

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-[80px]">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white p-1 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-xl font-bold">Settings</h1>
            </header>

            <main className="flex-1 p-4 flex flex-col gap-6">
                {/* Appearance Section */}
                <section>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Appearance</h2>
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                                </div>
                                <span className="font-semibold text-sm">Dark Mode</span>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={toggleTheme}
                                className={clsx(
                                    "w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
                                    theme === 'dark' ? "bg-primary" : "bg-slate-200"
                                )}
                            >
                                <div className={clsx(
                                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out",
                                    theme === 'dark' ? "translate-x-6" : "translate-x-0"
                                )}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                <section>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Account</h2>
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">person</span>
                                <span className="font-semibold text-sm">Edit Profile</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 text-[20px]">chevron_right</span>
                        </button>

                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">notifications</span>
                                <span className="font-semibold text-sm">Notifications</span>
                            </div>
                            {/* Simple Toggle - Visual Only for now */}
                            <div className="w-12 h-6 rounded-full bg-primary relative cursor-pointer">
                                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm translate-x-6"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Logout Button */}
                <div className="mt-8">
                    <button className="w-full py-3 text-red-500 font-bold text-sm bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                        Log Out
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-4">Version 1.0.2 (Build 240)</p>
                </div>
            </main>
        </div>
    );
}
