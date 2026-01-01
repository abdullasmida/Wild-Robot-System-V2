import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
    Building2, MapPin, ArrowRight, CheckCircle,
    GraduationCap, BicepsFlexed, Banknote, Palette,
    ChevronLeft, Sparkles, AlertTriangle
} from 'lucide-react';

const AcademySetup = () => {
    // State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [debugLog, setDebugLog] = useState([]);

    // Data
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        businessType: 'academy',
        sport: 'Gymnastics',
        scale: '1-50',
        currency: 'AED',
        brandColor: '#10b981'
    });

    const totalSteps = 4;

    // Helper to log debug info safely
    const log = (msg, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        const line = `[${timestamp}] ${msg} ${data ? JSON.stringify(data) : ''}`;
        console.log(line);
        setDebugLog(prev => [...prev.slice(-4), line]);
    };

    // 1. Initial Check on Mount (HOTFIXED: Uses maybeSingle to avoid 406)
    useEffect(() => {
        const checkExistingAcademy = async () => {
            log("Checking existing academy...");
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    log("No user session.");
                    return;
                }

                // Use maybeSingle to avoid 406 error on empty rows
                const { data, error } = await supabase
                    .from('academies')
                    .select('*')
                    .eq('owner_id', user.id)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    log("Academy found, redirecting...", data.id);
                    // Academy exists, redirect
                    window.location.href = '/owner/dashboard';
                } else {
                    log("No academy found. Ready for setup.");
                }

            } catch (err) {
                console.error('Check failed:', err);
                log("Check error (ignoring):", err.message);
                // Don't alert on 406/Not found, just let them setup
            } finally {
                setLoading(false); // CRITICAL: Must run to remove white screen
            }
        };
        checkExistingAcademy();
    }, []);

    // 2. Field Updates
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    // 3. SUBMISSION LOGIC
    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        log("🚀 Starting Submission...");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Session expired. Please copy your data and refresh.");

            const subscriptionModel = formData.businessType === 'academy' ? 'term_based' : 'monthly_recurring';

            // B. Insert Academy
            log("Upserting Academy...");
            const { data: academy, error: upsertError } = await supabase
                .from('academies')
                .upsert({
                    owner_id: user.id,
                    name: formData.name,
                    location: formData.location,
                    business_type: formData.businessType,
                    type: formData.sport,
                    currency: formData.currency,
                    subscription_model: subscriptionModel,
                    brand_color: formData.brandColor,
                    setup_completed: true,
                    subscription_status: 'trial'
                }, { onConflict: 'owner_id' })
                .select()
                .single();

            if (upsertError) throw upsertError;
            log("✅ Academy Created:", academy.id);

            // C. Link Profile
            log("Linking Profile...");
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    academy_id: academy.id,
                    role: 'owner'
                })
                .eq('id', user.id);

            if (profileError) throw profileError;
            log("✅ Profile Linked.");

            // D. Success
            window.location.href = '/owner/dashboard';

        } catch (err) {
            console.error("SETUP ERROR:", err);
            setError(err.message); // Show visible error
            log("💥 ERROR:", err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-slate-500">Initializing Setup...</p>
                    <div className="mt-4 text-xs font-mono text-slate-300 max-w-xs mx-auto text-left opacity-50">
                        {debugLog.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="w-full max-w-xl">

                {/* Header */}
                <div className="mb-8 text-center animate-fade-in-down">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Setup Your Kingdom</h1>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'}`} />
                        ))}
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Step {step} of 4</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative transition-all duration-300">

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 text-sm font-bold border-b border-red-100 animate-pulse">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span>Something went wrong!</span>
                            </div>
                            <p className="font-normal opacity-90">{error}</p>
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="p-8">
                        {step === 1 && (
                            <StepIdentity formData={formData} updateField={updateField} />
                        )}
                        {step === 2 && (
                            <StepBusiness formData={formData} updateField={updateField} />
                        )}
                        {step === 3 && (
                            <StepScale formData={formData} updateField={updateField} />
                        )}
                        {step === 4 && (
                            <StepBranding formData={formData} updateField={updateField} />
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                disabled={submitting}
                                className="text-slate-500 font-bold hover:text-slate-800 disabled:opacity-50 flex items-center gap-2 px-4 py-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={!formData.name}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Building...
                                    </>
                                ) : (
                                    <>
                                        Launch Kingdom <Sparkles className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StepIdentity = ({ formData, updateField }) => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold">Name your Kingdom</h2>
        </div>
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Academy Name</label>
            <input
                autoFocus
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-lg transition-colors"
                placeholder="Ex: Wild Robot Gym"
            />
        </div>
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
            <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                    value={formData.location}
                    onChange={e => updateField('location', e.target.value)}
                    className="w-full pl-12 p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold transition-colors"
                    placeholder="City, Country"
                />
            </div>
        </div>
    </div>
);

const StepBusiness = ({ formData, updateField }) => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Select Operation Mode</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div
                onClick={() => updateField('businessType', 'academy')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.businessType === 'academy' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
            >
                <GraduationCap className={`w-8 h-8 mb-2 ${formData.businessType === 'academy' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <h3 className="font-bold text-slate-900">Academy</h3>
                <p className="text-xs text-slate-500 mt-1">Term-based</p>
            </div>
            <div
                onClick={() => updateField('businessType', 'club')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.businessType === 'club' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
            >
                <BicepsFlexed className={`w-8 h-8 mb-2 ${formData.businessType === 'club' ? 'text-blue-600' : 'text-slate-400'}`} />
                <h3 className="font-bold text-slate-900">Club</h3>
                <p className="text-xs text-slate-500 mt-1">Membership</p>
            </div>
        </div>
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Primary Sport</label>
            <select
                value={formData.sport}
                onChange={e => updateField('sport', e.target.value)}
                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold"
            >
                {['Gymnastics', 'Swimming', 'CrossFit', 'Martial Arts', 'Football', 'General Fitness'].map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
    </div>
);

const StepScale = ({ formData, updateField }) => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Scale & Currency</h2>
        </div>
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Athlete Check</label>
            <div className="grid grid-cols-3 gap-3">
                {['1-50', '51-200', '200+'].map(opt => (
                    <button
                        key={opt}
                        onClick={() => updateField('scale', opt)}
                        className={`py-3 rounded-xl border-2 font-bold text-sm ${formData.scale === opt ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-500 hover:border-emerald-200'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Operating Currency</label>
            <div className="relative">
                <Banknote className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <select
                    value={formData.currency}
                    onChange={e => updateField('currency', e.target.value)}
                    className="w-full pl-12 p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold"
                >
                    <option value="AED">AED (Emirati Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SAR">SAR (Saudi Riyal)</option>
                    <option value="EUR">EUR (Euro)</option>
                </select>
            </div>
        </div>
    </div>
);

const StepBranding = ({ formData, updateField }) => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-6">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                <Palette className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold">Theme Color</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
            {[
                { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
                { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
                { name: 'Purple', hex: '#8b5cf6', bg: 'bg-purple-500' },
                { name: 'Orange', hex: '#f97316', bg: 'bg-orange-500' }
            ].map(color => (
                <button
                    key={color.name}
                    onClick={() => updateField('brandColor', color.hex)}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.brandColor === color.hex ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}
                >
                    <div className={`w-8 h-8 rounded-full ${color.bg} shadow-sm`} />
                    <span className="font-bold text-slate-700">{color.name}</span>
                    {formData.brandColor === color.hex && <CheckCircle className="ml-auto w-5 h-5 text-slate-900" />}
                </button>
            ))}
        </div>
    </div>
);

export default AcademySetup;
