import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient'; // تأكد إن المسار صح

export default function SessionCommander() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // metadata coming from Schedule Page
    const sessionMeta = location.state || { branch: 'Unknown', level: 'Class', title: 'Session' };

    // --- State ---\
    const [mode, setMode] = useState('attendance'); // 'attendance' | 'skills' | 'planning'
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 1. Fetch Real Roster 🟢 + Real-time Subscription ⚡
    useEffect(() => {
        if (!sessionId) return;

        fetchRoster();

        // 🟢 REAL-TIME SUBSCRIPTION
        const channel = supabase
            .channel(`session_roster_${sessionId}`)
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'enrollments', filter: `session_id=eq.${sessionId}` },
                (payload) => {
                    console.log('Real-time update received!', payload);
                    setStudents(currentStudents => currentStudents.map(s => {
                        if (s.enrollmentId === payload.new.id) {
                            return { ...s, status: payload.new.status };
                        }
                        return s;
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const fetchRoster = async () => {
        setLoading(true);
        try {
            // Join enrollments with profiles to get student names
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    id,
                    status,
                    student:profiles (id, full_name, avatar_url)
                `)
                .eq('session_id', sessionId);

            if (error) throw error;

            // Format data for UI
            const formattedStudents = data.map(record => ({
                enrollmentId: record.id, // Important for updates
                studentId: record.student.id,
                name: record.student.full_name,
                avatar: record.student.avatar_url,
                status: record.status // 'present', 'absent', etc.
            }));

            setStudents(formattedStudents);
        } catch (err) {
            console.error('Roster Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Real-time Attendance Update (The "Wire") ⚡
    const updateAttendance = async (enrollmentId, newStatus) => {
        // 1. Snapshot: Keep old state for rollback
        const previousStudents = [...students];

        // 2. Optimistic Update: Instant feedback
        setStudents(prev => prev.map(s =>
            s.enrollmentId === enrollmentId ? { ...s, status: newStatus } : s
        ));

        // 3. Network Request
        try {
            const { error } = await supabase
                .from('enrollments')
                .update({ status: newStatus })
                .eq('id', enrollmentId);

            if (error) throw error;
        } catch (err) {
            console.error('Update Failed:', err);

            // 4. 🚨 ROLLBACK: Revert immediately
            setStudents(previousStudents);

            // 5. Alert: Notify coach
            alert("⚠️ Connection Failed! Attendance was NOT saved.");
        }
    };

    const handleBulkAction = async (actionType) => {
        if (actionType === 'mark_all_present') {
            setSaving(true);
            const updates = students.map(s => updateAttendance(s.enrollmentId, 'present'));
            await Promise.all(updates);
            setSaving(false);
        }
    };

    // --- UI Components ---

    const renderHeader = () => (
        <div className="bg-white sticky top-0 z-20 border-b border-gray-100 shadow-sm">
            <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="font-black text-slate-800 text-lg leading-tight">{sessionMeta.title}</h1>
                        <p className="text-xs text-slate-500 font-bold">{sessionMeta.branch} • {sessionMeta.level}</p>
                    </div>
                </div>
                {saving && <div className="text-xs font-bold text-emerald-500 animate-pulse">Saving...</div>}
            </div>

            {/* Tri-Mode Switcher */}
            <div className="px-4 pb-4 max-w-3xl mx-auto">
                <div className="bg-slate-100 p-1 rounded-xl flex font-bold text-xs relative">
                    {/* Sliding Background */}
                    <motion.div
                        className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm z-0"
                        layoutId="tab-bg"
                        initial={false}
                        animate={{
                            left: mode === 'attendance' ? '4px' : mode === 'skills' ? '33.33%' : '66.66%',
                            width: '32%'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    {['attendance', 'skills', 'planning'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={clsx(
                                "flex-1 py-2.5 rounded-lg z-10 transition-colors capitalize relative",
                                mode === m ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // MODE 1: ATTENDANCE
    const renderAttendance = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 px-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {students.length} Athletes Listed
                </p>
                <button
                    onClick={() => handleBulkAction('mark_all_present')}
                    className="text-emerald-600 text-xs font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Mark All Present
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div></div>
            ) : students.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                    <p>No students enrolled yet.</p>
                </div>
            ) : (
                students.map((student) => (
                    <motion.div
                        layout
                        key={student.enrollmentId}
                        className={clsx(
                            "bg-white p-4 rounded-2xl border transition-all flex items-center justify-between",
                            student.status === 'present' ? "border-emerald-500 shadow-md shadow-emerald-100" : "border-slate-100"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover bg-slate-100" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg">
                                    {student.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-slate-800">{student.name}</h3>
                                <p className={clsx("text-xs font-bold", student.status === 'present' ? "text-emerald-600" : "text-slate-400")}>
                                    {student.status ? student.status.toUpperCase() : 'PENDING'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => updateAttendance(student.enrollmentId, 'absent')}
                                className={clsx(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                    student.status === 'absent' ? "bg-red-100 text-red-600" : "bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-400"
                                )}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <button
                                onClick={() => updateAttendance(student.enrollmentId, 'present')}
                                className={clsx(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                    student.status === 'present' ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-300 hover:bg-emerald-500 hover:text-white"
                                )}
                            >
                                <span className="material-symbols-outlined">check</span>
                            </button>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );

    // Placeholder for other modes
    const renderPlaceholder = (title) => (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">construction</span>
            <h3 className="font-bold text-slate-600">{title} Mode</h3>
            <p className="text-sm text-slate-400">Coming in Phase 3</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-inter pb-20">
            {renderHeader()}
            <main className="max-w-3xl mx-auto px-4 py-6">
                {mode === 'attendance' && renderAttendance()}
                {mode === 'skills' && renderPlaceholder("Skills Assessment")}
                {mode === 'planning' && renderPlaceholder("Session Planning")}
            </main>
        </div>
    );
}