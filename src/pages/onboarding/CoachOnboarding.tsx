import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { Check, ChevronRight, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
];

export default function CoachOnboarding() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // State to track selected slots: { "Monday": ["09:00", "10:00"], ... }
    const [availability, setAvailability] = useState<Record<string, string[]>>({});

    const toggleSlot = (day: string, time: string) => {
        setAvailability(prev => {
            const daySlots = prev[day] || [];
            if (daySlots.includes(time)) {
                return { ...prev, [day]: daySlots.filter(t => t !== time) };
            } else {
                return { ...prev, [day]: [...daySlots, time] };
            }
        });
    };

    const handleSave = async () => {
        if (Object.keys(availability).length === 0) {
            toast.error("Please select at least one available slot.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('staff_details')
                .update({ availability: availability })
                .eq('profile_id', user?.id);

            if (error) throw error;

            toast.success("Availability Set! Welcome to the team.");
            navigate('/coach/dashboard');

        } catch (err: any) {
            console.error(err);
            toast.error('Failed to save availability');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg" />
                    <span className="font-bold text-lg text-slate-900 tracking-tight">Wild Robot</span>
                </div>
                <div className="text-sm font-medium text-slate-500">
                    Step 1 of 3: Availability
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">When can you teach? 📅</h1>
                    <p className="text-lg text-slate-500">
                        Select your preferred hours. This helps the Academy Owner schedule classes for you.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-[100px_1fr] divide-x divide-slate-100">
                        {DAYS.map(day => (
                            <React.Fragment key={day}>
                                {/* Day Label */}
                                <div className="p-4 flex items-center justify-center bg-slate-50 font-bold text-slate-600 border-b border-slate-100">
                                    {day.slice(0, 3)}
                                </div>

                                {/* Time Slots */}
                                <div className="p-4 flex flex-wrap gap-2 border-b border-slate-100">
                                    {TIME_SLOTS.map(time => {
                                        const isSelected = availability[day]?.includes(time);
                                        return (
                                            <button
                                                key={`${day}-${time}`}
                                                onClick={() => toggleSlot(day, time)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected
                                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : 'Confirm Availability'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
