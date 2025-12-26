import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Trophy, ArrowRight, Check, Building2, Dumbbell, MapPin, Loader2 } from 'lucide-react';

export default function SetupWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        academyName: '',
        sport: '',
        branches: '1'
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Get Fresh User directly from Supabase
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                // Redirect immediately if session is dead
                window.location.href = '/login';
                return;
            }

            // 2. Insert Academy
            const { data: academy, error: academyError } = await supabase
                .from('academies')
                .insert([{
                    name: formData.academyName,
                    owner_id: user.id,
                    sport_type: formData.sport,
                    branch_count_tier: formData.branches
                }])
                .select()
                .single();

            if (academyError) throw academyError;

            // 3. Link Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    academy_id: academy.id,
                    role: 'owner',
                    onboarding_step: 4,
                    academy_name: formData.academyName
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 4. Force Token Refresh (Critical for RLS to update immediately)
            await supabase.auth.refreshSession();

            // 5. Redirect (Force Reload to ensure clean state)
            window.location.href = '/coach/home';

        } catch (error) {
            console.error("Setup Error:", error);
            alert("Setup failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans">

            {/* Progress Bar */}
            <div className="w-full max-w-lg mb-8">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <span>Step {step} of 3</span>
                    <span>{Math.round((step / 3) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <motion.div
                className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: NAME */}
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                    <Building2 size={28} />
                                </div>
                                <h2 className="text-3xl font-black mb-3">Name your Academy</h2>
                                <p className="text-slate-500 mb-8 font-medium">This will be displayed on your branded certificates and reports.</p>

                                <input
                                    autoFocus
                                    type="text"
                                    value={formData.academyName}
                                    onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
                                    placeholder="e.g. Elite Sports Club"
                                    className="w-full text-xl font-bold border-b-2 border-slate-200 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-300"
                                />
                                <div className="mt-8 flex justify-end">
                                    <button
                                        disabled={!formData.academyName.trim()}
                                        onClick={handleNext}
                                        className="bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                    >
                                        Next Step <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: SPORT */}
                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                                    <Dumbbell size={28} />
                                </div>
                                <h2 className="text-3xl font-black mb-3">What's your main sport?</h2>
                                <p className="text-slate-500 mb-8 font-medium">We'll tailor the experience to your training style.</p>

                                <div className="space-y-3">
                                    {['Gymnastics', 'Swimming', 'Football', 'Basketball', 'Martial Arts', 'Other'].map((sport) => (
                                        <button
                                            key={sport}
                                            onClick={() => setFormData({ ...formData, sport })}
                                            className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all flex items-center justify-between ${formData.sport === sport
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                                }`}
                                        >
                                            {sport}
                                            {formData.sport === sport && <Check size={20} className="text-emerald-600" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-between">
                                    <button onClick={handleBack} className="text-slate-400 font-bold hover:text-slate-600">Back</button>
                                    <button
                                        disabled={!formData.sport}
                                        onClick={handleNext}
                                        className="bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                    >
                                        Next Step <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: BRANCHES */}
                        {step === 3 && (
                            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                    <MapPin size={28} />
                                </div>
                                <h2 className="text-3xl font-black mb-3">How big is your team?</h2>
                                <p className="text-slate-500 mb-8 font-medium">This helps us set up your branch management.</p>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { val: '1', label: 'Single Branch', desc: 'Just one location' },
                                        { val: '2-5', label: 'Growing (2-5)', desc: 'Multiple locations' },
                                        { val: '5+', label: 'Enterprise (5+)', desc: 'Large scale operation' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            onClick={() => setFormData({ ...formData, branches: opt.val })}
                                            className={`p-5 rounded-2xl border-2 text-left transition-all ${formData.branches === opt.val
                                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                                                : 'border-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="font-bold text-slate-900">{opt.label}</div>
                                            <div className="text-xs text-slate-500 font-medium">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-between items-center">
                                    <button onClick={handleBack} className="text-slate-400 font-bold hover:text-slate-600">Back</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 min-w-[140px] justify-center"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Launch Academy 🚀'}
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
