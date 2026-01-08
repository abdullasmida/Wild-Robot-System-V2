import React, { useState, useEffect } from 'react';
import {
    User, Phone, Heart, Trash2, Plus,
    Sparkles, AlertCircle, Save, Mail, Briefcase, Medal
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';

const AthleteInviteForm = ({ onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);

    // Data Sources
    const [coaches, setCoaches] = useState([]);
    const [levels, setLevels] = useState([]);

    // Batch State
    const [entries, setEntries] = useState([
        {
            id: Date.now(),
            name: '',
            email: '',
            gender: 'male',
            dob: '2015-01-01',
            coachId: '',
            levelId: '',
            guardianName: '',
            guardianPhone: '',
            relationship: 'parent',
            medicalTags: []
        }
    ]);

    const MEDICAL_TAGS = ['Asthma', 'Diabetes', 'Epilepsy', 'Nut Allergy', 'Injury History'];

    // --- Init ---
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Academy ID first
            const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.id).single();
            if (!profile?.academy_id) return;

            // Fetch Coaches
            const { data: coachList } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('academy_id', profile.academy_id)
                .in('role', ['coach', 'head_coach']);
            setCoaches(coachList || []);

            // Fetch Levels
            const { data: levelList } = await supabase
                .from('levels')
                .select('id, name')
                .eq('academy_id', profile.academy_id)
                .order('order_index');
            setLevels(levelList || []);
        };
        fetchData();
    }, []);

    // --- Actions ---

    const addRow = () => {
        setEntries(prev => [
            ...prev,
            {
                id: Date.now(),
                name: '',
                email: '',
                gender: 'male',
                dob: '2015-01-01',
                coachId: '',
                levelId: '',
                guardianName: '',
                guardianPhone: '',
                relationship: 'parent',
                medicalTags: []
            }
        ]);
    };

    const removeRow = (id) => {
        if (entries.length > 1) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleChange = (id, field, value) => {
        if (field === 'guardianPhone') value = value.replace(/[^0-9+ ]/g, '');

        setEntries(prev => prev.map(entry => {
            if (entry.id === id) {
                return { ...entry, [field]: value };
            }
            return entry;
        }));
    };

    const toggleMedical = (id, tag) => {
        setEntries(prev => prev.map(entry => {
            if (entry.id === id) {
                const tags = entry.medicalTags.includes(tag)
                    ? entry.medicalTags.filter(t => t !== tag)
                    : [...entry.medicalTags, tag];
                return { ...entry, medicalTags: tags };
            }
            return entry;
        }));
    };

    // --- Submission ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Processing Recruitment Batch...");

        let successCount = 0;
        let failCount = 0;
        const failedNames = [];

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No session");

            // Get Academy ID
            const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.id).single();
            if (!profile?.academy_id) throw new Error("No Academy Linked");

            // Loop through entries
            for (const entry of entries) {
                try {
                    // 1. Insert/Get Guardian
                    const { data: guardian, error: guardianError } = await supabase
                        .from('guardians')
                        .insert({
                            academy_id: profile.academy_id,
                            name: entry.guardianName,
                            phone: entry.guardianPhone,
                            email: entry.email, // Store parent/athlete email here too if needed, or primarily in athlete
                            relationship_type: entry.relationship
                        })
                        .select()
                        .single();

                    if (guardianError) throw guardianError;

                    // 2. Insert Athlete
                    const { data: athlete, error: athleteError } = await supabase
                        .from('athletes')
                        .insert({
                            academy_id: profile.academy_id,
                            name: entry.name,
                            email: entry.email, // New Field
                            coach_id: entry.coachId || null, // New Field
                            level_id: entry.levelId || null, // New Field
                            gender: entry.gender,
                            dob: entry.dob,
                            medical_info: { tags: entry.medicalTags },
                            stats: { overall: 60 }
                        })
                        .select()
                        .single();

                    if (athleteError) throw athleteError;

                    // 3. Link
                    const { error: linkError } = await supabase
                        .from('athlete_guardians')
                        .insert({
                            athlete_id: athlete.id,
                            guardian_id: guardian.id
                        });

                    if (linkError) throw linkError;

                    // 4. Send Invite Email (if email exists)
                    if (entry.email) {
                        try {
                            // A. Create Invitation Record
                            const token = self.crypto.randomUUID();
                            const { error: inviteError } = await supabase
                                .from('invitations')
                                .insert({
                                    academy_id: profile.academy_id,
                                    email: entry.email,
                                    role: 'athlete',
                                    token: token,
                                    status: 'pending'
                                });

                            if (inviteError) {
                                console.error("Failed to create invitation record", inviteError);
                                throw inviteError;
                            }

                            // B. Send Email via API
                            await fetch('/api/send-invite', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: entry.email,
                                    firstName: entry.name.split(' ')[0],
                                    role: 'athlete',
                                    token: token // Pass the token!
                                })
                            });
                        } catch (emailErr) {
                            console.error("Invite Email Failed (Non-blocking):", emailErr);
                            // We don't fail the whole batch if email fails, but we log it
                            toast.error(`Hero saved, but invite failed for ${entry.name}`);
                        }
                    }

                    successCount++;

                } catch (innerErr) {
                    console.error(`Failed to add ${entry.name}`, innerErr);
                    failCount++;
                    failedNames.push(entry.name || 'Unknown');
                }
            }

            // Final Report
            if (failCount === 0) {
                toast.success(`Recruited ${successCount} new heroes!`, { id: toastId });
                onSuccess(); // Close modal
            } else {
                toast.warning(`${successCount} succeeded, ${failCount} failed (${failedNames.join(', ')}).`, { id: toastId });
            }

        } catch (err) {
            console.error("Batch Error:", err);
            toast.error(err.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-50">

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                <div className="flex items-center gap-2 mb-2 px-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        Batch Entry Mode
                    </span>
                </div>

                {entries.map((entry, index) => (
                    <div key={entry.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 animate-fade-in-up relative group">

                        {/* Remove Button (Only if > 1) */}
                        {entries.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeRow(entry.id)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        <div className="grid grid-cols-1 gap-4">

                            {/* Row 1: Athlete Identity */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Hero Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                        <input
                                            required
                                            value={entry.name}
                                            onChange={e => handleChange(entry.id, 'name', e.target.value)}
                                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-bold text-sm"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email (For Invite)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                        <input
                                            type="email"
                                            value={entry.email}
                                            onChange={e => handleChange(entry.id, 'email', e.target.value)}
                                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-medium text-sm"
                                            placeholder="athlete@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Gender</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium"
                                        value={entry.gender}
                                        onChange={e => handleChange(entry.id, 'gender', e.target.value)}
                                    >
                                        <option value="male">Boy</option>
                                        <option value="female">Girl</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">DOB</label>
                                    <input
                                        type="date"
                                        required
                                        value={entry.dob}
                                        onChange={e => handleChange(entry.id, 'dob', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-bold text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Row 1.5: Assignment */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-6">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> Assign Coach
                                    </label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium"
                                        value={entry.coachId}
                                        onChange={e => handleChange(entry.id, 'coachId', e.target.value)}
                                    >
                                        <option value="">-- Select Coach --</option>
                                        {coaches.map(c => (
                                            <option key={c.id} value={c.id}>{c.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-6">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1">
                                        <Medal className="w-3 h-3" /> Level
                                    </label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium"
                                        value={entry.levelId}
                                        onChange={e => handleChange(entry.id, 'levelId', e.target.value)}
                                    >
                                        <option value="">-- Select Level --</option>
                                        {levels.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-100" />

                            {/* Row 2: Guardian & Medical */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Guardian Name</label>
                                    <input
                                        required
                                        value={entry.guardianName}
                                        onChange={e => handleChange(entry.id, 'guardianName', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-medium text-sm"
                                        placeholder="Parent Name"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contact Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                        <input
                                            required
                                            type="tel"
                                            value={entry.guardianPhone}
                                            onChange={e => handleChange(entry.id, 'guardianPhone', e.target.value)}
                                            className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-medium text-sm"
                                            placeholder="+971..."
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1">
                                        Medical <Heart className="w-3 h-3 text-red-400" />
                                    </label>
                                    <div className="flex flex-wrap gap-1">
                                        {MEDICAL_TAGS.slice(0, 3).map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleMedical(entry.id, tag)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${entry.medicalTags.includes(tag)
                                                    ? 'bg-red-50 border-red-200 text-red-600'
                                                    : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}

                {/* Add Row Button */}
                <button
                    type="button"
                    onClick={addRow}
                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Another Hero
                </button>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between z-10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    Cancel
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-400">
                        {entries.length} Hero{entries.length > 1 ? 'es' : ''} Ready
                    </span>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Recruit All Heroes'}
                        <Save className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AthleteInviteForm;
