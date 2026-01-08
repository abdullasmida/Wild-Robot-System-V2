import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    Building2, MapPin, ArrowRight, CheckCircle,
    GraduationCap, BicepsFlexed, Banknote, Palette,
    ChevronLeft, Sparkles, AlertTriangle, Loader2
} from 'lucide-react';

interface SetupWizardModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export default function SetupWizardModal({ isOpen, onComplete }: SetupWizardModalProps) {
    // State
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    if (!isOpen) return null;

    // 2. Field Updates
    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    // 3. SUBMISSION LOGIC
    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Session expired. Please refresh.");

            const subscriptionModel = formData.businessType === 'academy' ? 'term_based' : 'monthly_recurring';

            // B. Insert Academy
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

            // C. Link Profile & Mark Setup Complete
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    academy_id: academy.id,
                    role: 'owner', // Confirm owner role
                    setup_completed: true // CRITICAL: Mark as complete
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // D. Force Session Sync
            await useAuthStore.getState().checkSession();

            // E. Close Modal
            onComplete();

        } catch (err: any) {
            console.error("SETUP ERROR:", err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- SUB-COMPONENTS (Inline for simplicity within Modal) ---

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

            {/* Modal Content */}
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Setup Your Kingdom</h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'}`} />
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-2">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold">Identity</h3>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Academy Name</label>
                                <input
                                    autoFocus
                                    value={formData.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-lg transition-colors placeholder:font-normal"
                                    placeholder="Ex: Wild Robot Gym"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        value={formData.location}
                                        onChange={e => updateField('location', e.target.value)}
                                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-medium transition-colors"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold">Operations</h3>
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
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Sport</label>
                                <select
                                    value={formData.sport}
                                    onChange={e => updateField('sport', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold"
                                >
                                    {['Gymnastics', 'Swimming', 'CrossFit', 'Martial Arts', 'Football', 'General Fitness'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold">Scale & Finance</h3>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Athlete Check</label>
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
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Operating Currency</label>
                                <div className="relative">
                                    <Banknote className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        value={formData.currency}
                                        onChange={e => updateField('currency', e.target.value)}
                                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold"
                                    >
                                        <option value="AED">AED (Emirati Dirham)</option>
                                        <option value="USD">USD (US Dollar)</option>
                                        <option value="SAR">SAR (Saudi Riyal)</option>
                                        <option value="EUR">EUR (Euro)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold">Brand Color</h3>
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
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
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
                                    <Loader2 className="w-4 h-4 animate-spin" />
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
    );
}
