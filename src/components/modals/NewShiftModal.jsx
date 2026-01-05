import React, { useState } from 'react';
import { X, CalendarPlus, Clock, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';

// Reusing mock data for locations/coaches for the dropdowns
// In a real app we'd fetch these or pass them as props
import { COACHES, LOCATIONS } from '../scheduler/mockData';

export default function NewShiftModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        coach_id: '',
        location_id: '',
        start_time: '09:00',
        end_time: '17:00'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        console.log("Saving Shift...", formData);

        try {
            // Calculate timestamps based on today's date + time string (Simplified)
            // In a real app, you'd select the Date too. assuming 'Today' for now or next availability.
            const today = new Date().toISOString().split('T')[0];
            const startTimestamp = `${today}T${formData.start_time}:00`;
            const endTimestamp = `${today}T${formData.end_time}:00`;

            const { data, error } = await supabase
                .from('staff_shifts')
                .insert([
                    {
                        coach_id: formData.coach_id,
                        location_id: formData.location_id,
                        start_time: startTimestamp,
                        end_time: endTimestamp,
                        role: 'Coach' // Default role
                    }
                ]);

            if (error) throw error;

            toast.success("Shift Created Successfully", {
                description: "The schedule has been updated."
            });

            // Cleanup
            onClose();
            // Ideally trigger a refresh of the schedule here (via Context/Callback)
            window.location.reload(); // Temporary force refresh to see changes

        } catch (err) {
            console.error(err);
            toast.error("Failed to create shift", {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-purple-500" />
                        Create New Shift
                    </h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign Staff</label>
                        <select
                            name="coach_id"
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-purple-500/20 outline-none"
                        >
                            <option value="">Select a Coach...</option>
                            {COACHES.map(c => (
                                <option key={c.id} value={c.id}>{c.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <select
                                name="location_id"
                                onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-purple-500/20 outline-none"
                            >
                                <option value="">Select Location...</option>
                                {LOCATIONS.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 rounded-lg shadow-lg shadow-purple-500/20 transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Create Shift
                    </button>
                </div>
            </div>
        </div>
    );
}
