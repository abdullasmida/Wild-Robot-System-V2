import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { Program, Profile } from '@/types/custom';
import { X, DollarSign, Users, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { format, addDays, getDay, parseISO, addMinutes, setHours, setMinutes, isBefore, isAfter, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface CreateBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS_OF_WEEK = [
    { id: 1, label: 'Mon', full: 'Monday' },
    { id: 2, label: 'Tue', full: 'Tuesday' },
    { id: 3, label: 'Wed', full: 'Wednesday' },
    { id: 4, label: 'Thu', full: 'Thursday' },
    { id: 5, label: 'Fri', full: 'Friday' },
    { id: 6, label: 'Sat', full: 'Saturday' },
    { id: 0, label: 'Sun', full: 'Sunday' },
];

export default function CreateBatchModal({ isOpen, onClose, onSuccess }: CreateBatchModalProps) {
    const { profile } = useUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data Sources
    const [programs, setPrograms] = useState<Program[]>([]);
    const [coaches, setCoaches] = useState<Profile[]>([]);
    const [locations, setLocations] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        program_id: '',
        name: '',
        lead_coach_id: '',
        location_id: '',

        // Schedule
        selectedDays: [] as number[], // 0-6
        startTime: '17:00',
        durationMinutes: 60,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 90), 'yyyy-MM-dd'), // Default ~3 months

        // Capacity & Finance
        capacity: 12,
        min_capacity_for_profit: 5,
        price: 0,
    });

    // Warning State
    const [coachWarning, setCoachWarning] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && profile?.academy_id) {
            fetchDependencies();
        }
    }, [isOpen, profile]);

    const fetchDependencies = async () => {
        const { data: progData } = await supabase.from('programs').select('*').eq('academy_id', profile?.academy_id);
        const { data: coachData } = await supabase.from('profiles').select('*').in('role', ['coach', 'head_coach']).eq('academy_id', profile?.academy_id);
        const { data: locData } = await supabase.from('locations').select('*').eq('academy_id', profile?.academy_id);

        if (progData) setPrograms(progData);
        if (coachData) setCoaches(coachData);
        if (locData) setLocations(locData);
    };

    // Auto-Name Generator
    useEffect(() => {
        if (formData.program_id && formData.startTime) {
            const prog = programs.find(p => p.id === formData.program_id);
            if (prog) {
                // e.g. "Swimming - 17:00"
                setFormData(prev => ({
                    ...prev,
                    name: `${prog.name} - ${formData.startTime}`
                }));
            }
        }
    }, [formData.program_id, formData.startTime, programs]);

    // Coach Availability Check (Simple)
    useEffect(() => {
        if (formData.lead_coach_id && formData.selectedDays.length > 0) {
            checkCoachSchedule();
        } else {
            setCoachWarning(null);
        }
    }, [formData.lead_coach_id, formData.selectedDays]);

    const checkCoachSchedule = async () => {
        // Placeholder Logic: 
        // In a real app, we'd query 'sessions' (staff shifts) for the next 7 days.
        // For now, we'll assume they are available but show a generic tip.
        // Or if we want to be fancy, we query 1 row.

        // Let's verify if they have ANY shifts in the system for context
        const { count } = await supabase
            .from('sessions') // STAFF SCHEDULE
            .select('*', { count: 'exact', head: true })
            .eq('academy_id', profile?.academy_id)
            .eq('is_published', true) // assuming existing logic uses published shifts
        // We can't easily join on assignments here efficiently without a dedicated RPC or careful query
        // So we'll skip the deep DB check for this MVP to avoid performance hit on every click

        // setCoachWarning("⚠️ Check if Coach has a shift assigned!");
    };

    // --- SUBMISSION ---

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Create Batch
            const { data: batch, error: batchError } = await supabase
                .from('batches')
                .insert({
                    academy_id: profile?.academy_id,
                    program_id: formData.program_id,
                    location_id: formData.location_id || locations[0]?.id, // fallback
                    lead_coach_id: formData.lead_coach_id,
                    name: formData.name,
                    schedule_rules: {
                        days: formData.selectedDays,
                        startTime: formData.startTime,
                        durationMinutes: formData.durationMinutes
                    },
                    capacity: formData.capacity,
                    min_capacity_for_profit: formData.min_capacity_for_profit,
                    price: formData.price,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    status: 'active'
                })
                .select()
                .single();

            if (batchError) throw batchError;
            if (!batch) throw new Error("Failed to create batch");

            // 2. Generate Sessions (Client Side Loop)
            const sessionsToInsert = [];
            let currentDate = parseISO(formData.startDate);
            const endDate = parseISO(formData.endDate);

            // Time setup
            const [startHour, startMinute] = formData.startTime.split(':').map(Number);

            while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
                const dayOfWeek = getDay(currentDate); // 0 = Sun

                if (formData.selectedDays.includes(dayOfWeek)) {
                    // Create Session
                    const sessionStart = setMinutes(setHours(currentDate, startHour), startMinute);
                    const sessionEnd = addMinutes(sessionStart, formData.durationMinutes);

                    sessionsToInsert.push({
                        academy_id: profile?.academy_id,
                        batch_id: batch.id,
                        date: format(currentDate, 'yyyy-MM-dd'),
                        start_time: sessionStart.toISOString(),
                        end_time: sessionEnd.toISOString(),
                        coach_id: formData.lead_coach_id, // Default to batch lead
                        status: 'scheduled'
                    });
                }
                currentDate = addDays(currentDate, 1);
            }

            // Bulk Insert
            if (sessionsToInsert.length > 0) {
                const { error: sessionError } = await supabase
                    .from('class_sessions')
                    .insert(sessionsToInsert);

                if (sessionError) throw sessionError;
            }

            toast.success(`Batch "${batch.name}" Created!`, {
                description: `Generated ${sessionsToInsert.length} class sessions.`
            });
            onSuccess();
            onClose();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create batch");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Create New Batch</h2>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1 w-8 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Program</label>
                                <select
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.program_id}
                                    onChange={e => setFormData({ ...formData, program_id: e.target.value })}
                                >
                                    <option value="">Select a Program...</option>
                                    {programs.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Swimming L1 - Mon/Wed"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lead Coach</label>
                                <select
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.lead_coach_id}
                                    onChange={e => setFormData({ ...formData, lead_coach_id: e.target.value })}
                                >
                                    <option value="">Select Coach...</option>
                                    {coaches.map(c => (
                                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                    ))}
                                </select>
                                {coachWarning && (
                                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        {coachWarning}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Repeat On</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.id}
                                            onClick={() => {
                                                const current = formData.selectedDays;
                                                const newDays = current.includes(day.id)
                                                    ? current.filter(d => d !== day.id)
                                                    : [...current, day.id];
                                                setFormData({ ...formData, selectedDays: newDays });
                                            }}
                                            className={`
                                                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                                ${formData.selectedDays.includes(day.id)
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                            `}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-2.5 border border-slate-300 rounded-lg text-center"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border border-slate-300 rounded-lg text-center"
                                        value={formData.durationMinutes}
                                        onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min Students for Profit</label>
                                <p className="text-xs text-slate-500 mb-2">Used for the "Green Dot" radar indicator.</p>
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                    <input
                                        type="number"
                                        className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg ring-1 ring-emerald-100"
                                        value={formData.min_capacity_for_profit}
                                        onChange={e => setFormData({ ...formData, min_capacity_for_profit: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price per Student</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!formData.program_id} // Basic validation
                            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Batch'} <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
