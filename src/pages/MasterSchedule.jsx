import React, { useState, useEffect } from 'react';
import {
    format,
    addDays,
    subDays,
    isSameDay,
} from 'date-fns';
import { clsx } from 'clsx';
import { supabase } from '../supabaseClient';

export default function MasterSchedule() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [players, setPlayers] = useState([]);
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const [error, setError] = useState(null);

    const isAdmin = true; // Mock role

    useEffect(() => {
        fetchSessions(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        if (showQuickAdd) {
            fetchPlayers();
        }
    }, [showQuickAdd]);

    const fetchSessions = async (date) => {
        setLoading(true);
        setError(null);
        // Format date to YYYY-MM-DD for exact match
        const todayStr = format(date, 'yyyy-MM-dd');

        // Fetch Sessions with Enrollments
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select(`
                *,
                session_enrollments (
                    player:players ( id, name, level, parent_name, phone )
                )
            `)
            .eq('date', todayStr)
            .order('start_time', { ascending: true });

        if (sessionError) {
            console.error('Error fetching sessions:', sessionError);
            setError(sessionError.message); // Show error to user
            setLoading(false);
            return;
        }

        // Transform nested data to flat roster for UI
        const sessionsWithRoster = (sessionData || []).map(session => ({
            ...session,
            // TRANSFORM: Extract 'player' from 'session_enrollments' array
            roster: session.session_enrollments
                ? session.session_enrollments.map(enrollment => enrollment.player).filter(Boolean)
                : []
        }));

        setSessions(sessionsWithRoster);
        setLoading(false);
    };

    const fetchPlayers = async () => {
        const { data } = await supabase.from('players').select('*');
        if (data) setPlayers(data);
    };

    const handleDateChange = (direction) => {
        setSelectedDate(curr => direction === 'next' ? addDays(curr, 1) : subDays(curr, 1));
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-600 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => handleDateChange('prev')} className="p-1 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-slate-700">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-900 leading-none">{format(selectedDate, 'EEEE')}</h2>
                        <p className="text-xs font-medium text-emerald-500">{format(selectedDate, 'MMMM d, yyyy')}</p>
                    </div>
                    <button onClick={() => handleDateChange('next')} className="p-1 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-slate-700">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <button
                    onClick={() => setShowQuickAdd(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Quick Add Athlete
                </button>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto p-4 space-y-6">
                {error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center">
                        <p className="font-bold">Error loading schedule</p>
                        <p className="text-sm">{error}</p>
                        <p className="text-xs mt-2 text-red-400">Please check your database schema matches the query.</p>
                    </div>
                ) : loading ? (
                    <div className="text-center py-20 text-slate-400">Loading schedule...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4 text-slate-300">
                            <span className="material-symbols-outlined text-3xl">calendar_today</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No sessions today</h3>
                    </div>
                ) : (
                    sessions.map(session => (
                        <SessionCard key={session.id} session={session} isAdmin={isAdmin} />
                    ))
                )}
            </div>

            {/* Quick Add Modal */}
            {showQuickAdd && (
                <QuickAddModal
                    players={players}
                    sessions={sessions}
                    onClose={() => setShowQuickAdd(false)}
                />
            )}
        </div>
    );
}

function SessionCard({ session, isAdmin }) {
    const capacity = session.capacity || 15;
    // Mock Roster
    const roster = session.roster || [];
    const progress = (roster.length / capacity) * 100;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
            {/* Header */}
            <div className="p-5 border-b border-gray-50">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md",
                            session.branch === 'Ajman' ? 'bg-emerald-500' : 'bg-blue-500'
                        )}>
                            {session.branch ? session.branch.charAt(0) : 'G'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                                    {session.time_start} - {session.time_end}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">{session.title || 'Gymnastics Session'}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Coach</div>
                        <span className="text-sm font-semibold text-slate-700">{session.coach_name || 'Abdulla'}</span>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={clsx("h-full rounded-full transition-all", roster.length >= capacity ? "bg-red-500" : "bg-emerald-500")}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                        {roster.length} / {capacity}
                    </span>
                </div>
            </div>

            {/* Roster Table */}
            <div className="bg-white">
                {roster.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic text-sm">
                        No students enrolled.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        {/* Similar table code as in Schedule.jsx for roster */}
                        <tbody>
                            {roster.map(student => (
                                <tr key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="pl-5 py-3">
                                        <span className="font-bold text-slate-700 text-sm">{student.name}</span>
                                    </td>
                                    {/* Additional columns... */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function QuickAddModal({ players, sessions, onClose }) {
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Smart Logic to find recommended sessions for the selected player
    const getRecommendedSessions = (player) => {
        if (!player) return [];
        const isYoung = player.age < 7;
        const isAdvanced = ['Silver', 'Gold'].includes(player.level);

        if (isYoung) {
            return sessions.filter(s => parseInt(s.start_time.split(':')[0]) < 18);
        } else if (isAdvanced) {
            return sessions.filter(s => parseInt(s.start_time.split(':')[0]) >= 18);
        }
        return [];
    };

    const recommended = getRecommendedSessions(selectedPlayer);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-slate-900">
                        {selectedPlayer ? `Assign ${selectedPlayer.name}` : 'Select Player'}
                    </h3>
                    <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {!selectedPlayer ? (
                        players.map(player => (
                            <button
                                key={player.id}
                                onClick={() => setSelectedPlayer(player)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                            >
                                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                    {player.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{player.name}</p>
                                    <p className="text-xs text-slate-500">{player.level} • {player.age} yrs</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="space-y-2 p-2">
                            <button onClick={() => setSelectedPlayer(null)} className="text-sm text-emerald-600 hover:underline mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Back to players
                            </button>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Sessions</h4>
                            {sessions.map(session => {
                                const isRecommended = recommended.find(r => r.id === session.id);
                                return (
                                    <button
                                        key={session.id}
                                        className={clsx(
                                            "w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                                            isRecommended
                                                ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-sm"
                                                : "border-gray-100 bg-white hover:border-gray-300"
                                        )}
                                        onClick={() => {
                                            alert(`Assigned to ${session.start_time}!`);
                                            onClose();
                                        }}
                                    >
                                        {isRecommended && (
                                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                                RECOMMENDED
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-900">{session.title}</p>
                                                <p className="text-xs text-slate-500">{session.start_time} - {session.end_time} • {session.branch}</p>
                                            </div>
                                            {isRecommended && <span className="material-symbols-outlined text-emerald-600">check_circle</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
