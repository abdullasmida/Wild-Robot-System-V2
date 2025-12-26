import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import EvaluationCard from '../components/evaluation/EvaluationCard';

const SessionCommander = () => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [profile, setProfile] = useState(null);

    // Batch Logic - DYNAMIC NOW (or empty state)
    // Initially null, filled if we have dynamic sessions.
    // For MVP, if no sessions, show empty state.
    const [selectedBatch, setSelectedBatch] = useState(null);

    // Lifted States for "Session Commander"
    const [attendance, setAttendance] = useState({});
    const [trainingPlans, setTrainingPlans] = useState({});

    useEffect(() => {
        fetchSessionData();
    }, []);

    const fetchSessionData = async () => {
        setLoading(true);
        try {
            // 1. Get Coach Profile for Academy Name
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from('profiles')
                .select('academy_name')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // 2. Fetch Sessions/Batches (Future Implementation)
            // For now, if we don't have a schedule system fully hooked up to "Batches",
            // we will simulate an EMPTY state for new users, rather than showing "Ajman Batch A".
            // If you want to show ALL athletes as a single "Open Session":

            if (profileData?.academy_name) {
                const { data: playersData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('academy_name', profileData.academy_name)
                    .eq('role', 'athlete'); // Only athletes

                if (playersData && playersData.length > 0) {
                    // Create a pseudo-batch for "All Athletes"
                    const allBatch = { id: 'all', label: 'Open Session', time: 'Now', level: 'Mixed' };
                    setSelectedBatch(allBatch);

                    // Initialize Local State
                    const initialAttendance = {};
                    const initialPlans = {};
                    playersData.forEach(p => {
                        initialAttendance[p.id] = true;
                        initialPlans[p.id] = [];
                    });
                    setAttendance(initialAttendance);
                    setTrainingPlans(initialPlans);

                    // Enrich
                    const enriched = playersData.map(p => ({
                        ...p,
                        full_name: p.full_name || p.email,
                        skillsMap: [] // Empty skills for now
                    }));
                    setStudents(enriched);
                }
            }

        } catch (error) {
            console.error('Error fetching session data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleMarkAllPresent = () => {
        const newAttendance = { ...attendance };
        students.forEach(s => newAttendance[s.id] = true);
        setAttendance(newAttendance);
    };

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const updateTrainingPlan = (studentId, newPlan) => {
        setTrainingPlans(prev => ({ ...prev, [studentId]: newPlan }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <span className="material-symbols-outlined text-5xl animate-spin text-emerald-600">progress_activity</span>
            </div>
        );
    }

    if (!selectedBatch || students.length === 0) {
        return (
            <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-emerald-600">checklist</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">No Active Session</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    {profile?.academy_name ? `No athletes found for ${profile.academy_name}.` : "You haven't set up your academy yet."}
                    Start by adding athletes to your roster.
                </p>
                {/* Could link to Roster/Add Athlete */}
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen pb-32">
            {/* Header / Command Center */}
            <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md py-4 border-b border-slate-200 mb-8">
                <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600 text-4xl">checklist_rtl</span>
                                Session Commander
                            </h1>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                                Live
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium">{profile?.academy_name} • {selectedBatch.level} Squad</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Quick Actions */}
                        <button
                            onClick={handleMarkAllPresent}
                            className="bg-white border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined">done_all</span>
                            Mark All Present
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Grid */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto">
                {students.map(student => (
                    <EvaluationCard
                        key={student.id}
                        student={{
                            id: student.id,
                            name: student.full_name,
                            level: student.level || 'General',
                            age: student.age || 'N/A'
                        }}
                        levelData={student.skillsMap}
                        isPresent={!!attendance[student.id]}
                        onToggleAttendance={() => toggleAttendance(student.id)}
                        trainingPlan={trainingPlans[student.id] || []}
                        onUpdatePlan={(newPlan) => updateTrainingPlan(student.id, newPlan)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SessionCommander;
