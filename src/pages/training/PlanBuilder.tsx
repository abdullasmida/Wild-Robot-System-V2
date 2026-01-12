import React, { useState } from 'react';
import {
    Dumbbell,
    Save,
    Plus,
    Clock,
    GripVertical,
    Trash2,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';

import DrillPicker from '../../components/training/DrillPicker';

// Simplified types for the builder
interface PlanItem {
    id: string; // temp id
    type: 'drill' | 'skill' | 'note';
    referenceId?: string; // id of drill/skill
    title: string;
    duration: number; // minutes
    notes: string;
}

const PlanBuilder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [items, setItems] = useState<PlanItem[]>([]);

    // Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerType, setPickerType] = useState<'drill' | 'skill'>('drill');

    // Quick Add implementation (later replace with robust picker)
    const addItem = (type: 'drill' | 'skill' | 'note') => {
        const newItem: PlanItem = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title: type === 'note' ? 'New Note' : `Selected ${type}`,
            duration: 10,
            notes: ''
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof PlanItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSave = async () => {
        if (!title) return toast.error("Please enter a plan title");
        if (items.length === 0) return toast.error("Add at least one item");

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            // 1. Get Academy ID
            const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.id).single();
            if (!profile?.academy_id) throw new Error("No academy found");

            // 2. Create Plan Header
            const { data: plan, error: planError } = await supabase
                .from('workout_plans')
                .insert({
                    academy_id: profile.academy_id,
                    author_id: user.id,
                    title: title,
                    is_public: true // Default to public for now
                })
                .select()
                .single();

            if (planError) throw planError;

            // 3. Create Items
            // Note: We need real drill_id/skill_id in a real app. 
            // For this generic builder, we'll just save textual notes if referenceId is missing 
            // or assume the user selected valid IDs in the full implementation.
            const dbItems = items.map((item, index) => ({
                plan_id: plan.id,
                sort_order: index,
                duration_minutes: item.duration,
                notes: `${item.title} - ${item.notes}`, // Combining for simplicity if no real ID linkage yet
                // In full version: 
                // drill_id: item.type === 'drill' ? item.referenceId : null,
                // skill_id: item.type === 'skill' ? item.referenceId : null
            }));

            const { error: itemsError } = await supabase
                .from('workout_items')
                .insert(dbItems);

            if (itemsError) throw itemsError;

            toast.success("Workout Plan Created!");
            navigate('/command/training'); // Go back to library
        } catch (error) {
            console.error(error);
            toast.error("Failed to save plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up p-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <h1 className="text-2xl font-bold text-slate-900">New Lesson Plan</h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition active:scale-95 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Plan'}
                </button>
            </div>

            {/* Plan Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Plan Title</label>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., Level 3 Bar Routine Focus"
                    className="w-full text-xl font-bold placeholder:font-normal outline-none border-b-2 border-slate-100 focus:border-emerald-500 transition-colors py-2"
                />
            </div>

            {/* Picker Modal */}
            <DrillPicker
                isOpen={isPickerOpen}
                initialType={pickerType}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(item) => {
                    const newItem: PlanItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        type: item.type, // 'drill' or 'skill'
                        referenceId: item.id,
                        title: item.title || item.name,
                        duration: 10,
                        notes: ''
                    };
                    setItems([...items, newItem]);
                }}
            />

            {/* Timeline / Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-400" />
                        Timeline
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => addItem('note')} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition">
                            + Note
                        </button>
                        <button
                            onClick={() => { setPickerType('drill'); setIsPickerOpen(true); }}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition"
                        >
                            + Drill
                        </button>
                        <button
                            onClick={() => { setPickerType('skill'); setIsPickerOpen(true); }}
                            className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-100 transition"
                        >
                            + Skill
                        </button>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                        <Dumbbell className="w-8 h-8 mb-2 opacity-50" />
                        <p className="font-medium">Timeline is empty</p>
                        <p className="text-sm">Add drills or notes to start building.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 group">
                                <div className="mt-2 text-slate-300 cursor-move">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.type === 'note' ? 'bg-slate-100 text-slate-500' :
                                            item.type === 'drill' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                            {item.type}
                                        </span>
                                        <input
                                            value={item.title}
                                            onChange={e => updateItem(item.id, 'title', e.target.value)}
                                            className="font-bold text-slate-900 outline-none hover:bg-slate-50 rounded px-1 flex-1"
                                        />
                                    </div>

                                    <textarea
                                        value={item.notes}
                                        onChange={e => updateItem(item.id, 'notes', e.target.value)}
                                        placeholder="Coaching cues..."
                                        className="w-full text-sm text-slate-600 resize-none outline-none hover:bg-slate-50 rounded px-1 h-auto min-h-[40px]"
                                    />
                                </div>

                                <div className="flex items-center gap-3 border-l border-slate-100 pl-4 h-full">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Clock className="w-4 h-4" />
                                        <input
                                            type="number"
                                            value={item.duration}
                                            onChange={e => updateItem(item.id, 'duration', parseInt(e.target.value))}
                                            className="w-12 text-sm font-bold text-center outline-none border-b border-slate-200 focus:border-emerald-500"
                                        />
                                        <span className="text-xs">min</span>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PlanBuilder;
