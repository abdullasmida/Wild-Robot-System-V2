import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function PlayerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlayer();
    }, [id]);

    async function fetchPlayer() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setPlayer(data);
        } catch (err) {
            console.error('Error fetching player:', err);
            // Fallback for demo if no real data found given ID might be string
            if (id === 'demo') {
                setPlayer({
                    name: 'Adam Ali',
                    branch: 'Ajman',
                    level: 'Level 2',
                    subscription_total: 12,
                    subscription_used: 7,
                    expiry: '2023-12-31'
                })
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex bg-background-light dark:bg-background-dark min-h-screen items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
        );
    }

    if (error && !player) {
        return (
            <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen items-center justify-center gap-4">
                <p className="text-red-500">Player not found</p>
                <button onClick={() => navigate(-1)} className="text-primary">Go Back</button>
            </div>
        );
    }

    // Logic: Calculate Remaining Classes
    const total = player.subscription_total || 12; // Default to 12 if null
    const used = player.subscription_used || 0;
    const remaining = total - used;
    const progressPercentage = Math.min(100, (used / total) * 100);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-white dark:bg-[#111816] shadow-xl font-display">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center bg-white dark:bg-[#111816] p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="text-[#111816] dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back_ios_new</span>
                </button>
                <h1 className="text-[#111816] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
                    {player.name}
                </h1>
            </header>

            <main className="flex-1 flex flex-col p-4 gap-6 pb-32">
                {/* Headline */}
                <div>
                    <h2 className="text-[#111816] dark:text-white tracking-tight text-xl font-bold leading-tight">Current Package</h2>
                </div>

                {/* Subscription Card */}
                <div className="relative overflow-hidden rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-gradient-to-br from-[#10221c] to-[#1a3830] text-white">
                    {/* Background Image Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCyAvkFuAZx6X57ZSvwePZAnU9EL4DTYZUQoGE3t_vnCYNBcQOhupSdqVg44mNzNci_4DBHOjzSIvfnqzqzmoea7o-MnHds2XfJFolnVs_4L6IDrvttUXVHrlzT-31pdhTLTi88VvtkQwApPBHb-r5z6ung8CVTpgSzbxDjdrdL6OiO7pQsIp86-KLslvvtVXBOZvSQ6k9zUDBHofc0QwVkSymr1vBP2zOVdNRrvfIM2qbO8pi4_3gsw-B9tr6XQfRprWNaG6OqoXip")' }}>
                    </div>

                    <div className="relative p-6 flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-1">Membership</p>
                                <h3 className="text-2xl font-bold leading-tight">{player.level || 'General'} Term 1</h3>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                                Active
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <div className="flex justify-between items-end">
                                <p className="text-white/90 text-sm font-medium">Progress</p>
                                <p className="text-primary font-bold text-lg">{used}<span className="text-white/60 text-sm font-normal">/{total} Classes</span></p>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-white/40 text-xs text-right mt-1">
                                expires {player.expiry || 'Dec 31, 2025'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Attendance Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-[#111816] dark:text-white tracking-tight text-xl font-bold leading-tight pt-2">Attendance History</h2>
                    <div className="flex flex-col gap-3">
                        {/* Mock History Items for now */}
                        <AttendanceItem status="present" date="Dec 12" time="04:30 PM • Level 2" />
                        <AttendanceItem status="absent" date="Dec 10" time="04:30 PM • Level 2" />
                        <AttendanceItem status="excused" date="Dec 08" time="Sick Leave" />
                    </div>
                </div>
            </main>

            {/* Action Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-[#111816]/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4 max-w-md mx-auto pb-safe">
                <div className="flex flex-col gap-3">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]">
                        <span className="material-symbols-outlined">autorenew</span>
                        Renew Subscription
                    </button>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-background-light dark:bg-gray-800 px-6 py-3.5 text-base font-bold text-[#111816] dark:text-white transition-transform active:scale-[0.98] border border-gray-200 dark:border-gray-700">
                        <span className="material-symbols-outlined">ac_unit</span>
                        Freeze Membership
                    </button>
                </div>
            </footer>
        </div>
    );
}

function AttendanceItem({ status, date, time }) {
    const statusConfig = {
        present: { color: 'text-success', bg: 'bg-success/10', icon: 'check_circle', label: 'Present' },
        absent: { color: 'text-error', bg: 'bg-error/10', icon: 'cancel', label: 'Absent (Billable)' },
        excused: { color: 'text-warning', bg: 'bg-warning/10', icon: 'warning', label: 'Excused' },
    };

    const config = statusConfig[status];

    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-background-light dark:bg-gray-800/50 border border-transparent dark:border-gray-700">
            <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bg} ${config.color}`}>
                    <span className="material-symbols-outlined">{config.icon}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#111816] dark:text-white">{date}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
                </div>
            </div>
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
    );
}
