import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { useUser } from '../../context/UserContext';
import { Trophy, ArrowRight, Check, Building2, Dumbbell, MapPin, Loader2, SkipForward, Upload, Image as ImageIcon } from 'lucide-react';

export default function SetupModal({ onClose }) {
    const { user, profile, refreshProfile } = useUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [academyId, setAcademyId] = useState(null);

    const [formData, setFormData] = useState({
        academyName: '',
        sport: '',
        branches: '1',
        logoFile: null,
        logoPreview: null
    });

    // Initialize & Prefill
    useEffect(() => {
        const init = async () => {
            if (profile?.academy_id) {
                setAcademyId(profile.academy_id);
                // Fetch academy details to prefill
                const { data: acad } = await supabase.from('academies').select('*').eq('id', profile.academy_id).single();
                if (acad) {
                    setFormData(prev => ({
                        ...prev,
                        academyName: acad.name || '',
                        sport: acad.sport_type || '',
                        branches: acad.branch_count_tier || '1',
                        logoPreview: acad.logo_url || null
                    }));
                }
            }
        };
        init();
    }, [profile]);

    // Handle File Upload
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData({ ...formData, logoFile: file, logoPreview: previewUrl });
        }
    };

    // Save Progress Helper
    const saveProgress = async (currentData) => {
        try {
            if (!user) return;

            // Upsert Academy
            const acadPayload = {
                owner_id: user.id,
                name: currentData.academyName,
                sport_type: currentData.sport,
                branch_count_tier: currentData.branches
                // Note: Logo upload logic would normally go here (upload to storage -> get URL -> save URL)
            };

            let data, error;

            if (academyId) {
                const res = await supabase.from('academies').update(acadPayload).eq('id', academyId).select().single();
                data = res.data;
                error = res.error;
            } else {
                const res = await supabase.from('academies').insert([acadPayload]).select().single();
                data = res.data;
                error = res.error;
            }

            if (error) throw error;

            if (data && !academyId) {
                setAcademyId(data.id);
                // Link Profile immediately
                await supabase.from('profiles').update({ academy_id: data.id, academy_name: data.name }).eq('id', user.id);
            }

        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    };

    const handleNext = async () => {
        if (step < 3) {
            await saveProgress(formData);
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSkip = async () => {
        if (!confirm("Are you sure? You can complete this later in Settings.")) return;
        setLoading(true);
        try {
            await supabase.from('profiles').update({ setup_skipped: true }).eq('id', user.id);
            await refreshProfile();
            if (onClose) onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await saveProgress(formData);

            // Update Profile to 'completed' state
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    role: 'owner',
                    onboarding_step: 4,
                    academy_name: formData.academyName,
                    setup_skipped: false
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            await refreshProfile();
            if (onClose) onClose();

        } catch (error) {
            console.error("Setup Error:", error);
            alert("Setup failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <motion.div
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Skip Button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold text-xs flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-50"
                >
                    Skip <SkipForward size={14} />
                </button>

                <div className="p-8 md:p-10">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mb-8 justify-center">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'}`} />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">

                        {/* STEP 1: IDENTITY (Name & Logo) */}
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                                        <Building2 size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Name your Academy</h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1">This will be displayed on your branded certificates.</p>
                                </div>

                                {/* Logo Upload */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-colors">
                                        {formData.logoPreview ? (
                                            <img src={formData.logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload size={20} className="mx-auto text-slate-400 mb-1" />
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Logo</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity">
                                            Change
                                        </div>
                                    </div>
                                </div>

                                <input
                                    autoFocus
                                    type="text"
                                    value={formData.academyName}
                                    onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
                                    onBlur={() => saveProgress(formData)}
                                    placeholder="e.g. Elite Sports Club"
                                    className="w-full text-center text-xl font-bold border-b-2 border-slate-200 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-300 mb-8"
                                />

                                <div className="flex justify-center">
                                    <button
                                        disabled={!formData.academyName.trim()}
                                        onClick={handleNext}
                                        className="bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 w-full justify-center"
                                    >
                                        Next Step <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: SPORT */}
                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4">
                                        <Dumbbell size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Main Sport?</h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Tailors the training experience.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {['Gymnastics', 'Swimming', 'Football', 'Basketball', 'Martial Arts', 'Other'].map((sport) => (
                                        <button
                                            key={sport}
                                            onClick={() => setFormData({ ...formData, sport })}
                                            className={`p-3 rounded-xl border-2 text-center font-bold text-sm transition-all ${formData.sport === sport
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                                }`}
                                        >
                                            {sport}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between gap-4">
                                    <button onClick={handleBack} className="text-slate-400 font-bold hover:text-slate-600 px-4">Back</button>
                                    <button
                                        disabled={!formData.sport}
                                        onClick={handleNext}
                                        className="bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex-1 justify-center"
                                    >
                                        Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: BRANCHES */}
                        {step === 3 && (
                            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                                        <MapPin size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Scale?</h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Helps with branch management.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 mb-8">
                                    {[
                                        { val: '1', label: 'Single Branch', desc: 'Just one location' },
                                        { val: '2-5', label: 'Growing (2-5)', desc: 'Multiple locations' },
                                        { val: '5+', label: 'Enterprise (5+)', desc: 'Large scale operation' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            onClick={() => setFormData({ ...formData, branches: opt.val })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${formData.branches === opt.val
                                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                                                : 'border-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{opt.label}</div>
                                                <div className="text-[10px] text-slate-500 font-medium">{opt.desc}</div>
                                            </div>
                                            {formData.branches === opt.val && <Check size={18} className="text-emerald-600" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center gap-4">
                                    <button onClick={handleBack} className="text-slate-400 font-bold hover:text-slate-600 px-4">Back</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex-1 justify-center"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Launch 🚀'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
