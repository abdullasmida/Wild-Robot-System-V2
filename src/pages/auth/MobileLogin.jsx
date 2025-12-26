import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileLogin() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // إضافة كود الدولة لو مش مكتوب (افتراضي الإمارات +971)
            const formattedPhone = phone.startsWith('+') ? phone : `+971${phone.replace(/^0+/, '')}`;

            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });
            if (error) throw error;

            setStep(2); // Move to verify step
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+971${phone.replace(/^0+/, '')}`;

            const { data: { session, user }, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;

            // 🛑 Check Role immediately
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

            if (profile?.role === 'athlete') {
                navigate('/athlete');
            } else if (profile?.role === 'coach' || profile?.role === 'super_admin') {
                navigate('/coach/home');
            } else {
                // New User? Route to onboarding or default
                navigate('/athlete');
            }

        } catch (error) {
            alert('Invalid Code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-md">
                {/* Logo Area */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-blue-200">
                        <span className="material-symbols-outlined text-white text-3xl">smartphone</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500">Log in with your mobile number</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                onSubmit={handleSendOtp}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mobile Number</label>
                                    <div className="flex gap-2">
                                        <span className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 font-bold text-slate-500 flex items-center">🇦🇪 +971</span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="50 123 4567"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex justify-center">
                                    {loading ? <span className="animate-spin material-symbols-outlined">progress_activity</span> : "Send Code"}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 mb-4">Enter the code sent to <span className="font-bold text-slate-900">+971 {phone}</span></p>
                                    <div className="flex justify-center gap-2">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-black text-2xl tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="• • • • • •"
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex justify-center">
                                    {loading ? <span className="animate-spin material-symbols-outlined">progress_activity</span> : "Verify & Login"}
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 text-sm font-bold hover:text-slate-600">
                                    Wrong number? Go back
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}