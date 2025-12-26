import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function FakeCheckout() {
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan') || 'freelance';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });

    const handleFakePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Simulate Payment Delay (Makes it feel real) ⏳
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Real Registration Logic 🟢
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        // 🧠 SMART LOGIC: Freelance -> Coach | Business -> Super Admin
                        role: plan === 'business' ? 'super_admin' : 'coach',
                        subscription_status: 'active'
                    }
                }
            });

            if (error) throw error;

            // 3. Success! Redirect based on role
            alert(`🎉 Payment Successful! Welcome, ${plan === 'business' ? 'Boss' : 'Captain'}!`);
            navigate(plan === 'business' ? '/coach/staff' : '/coach/schedule');

        } catch (err) {
            alert("⚠️ Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-inter">
            <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-emerald-500 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50 skew-y-6 transform origin-bottom-left"></div>
                    <span className="material-symbols-outlined text-5xl mb-2 relative z-10">lock</span>
                    <h2 className="text-xl font-bold relative z-10">Secure Checkout (Test Mode)</h2>
                    <p className="text-emerald-100 text-xs uppercase tracking-widest font-bold mt-1 relative z-10">Plan: {plan}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleFakePayment} className="p-8 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                        <input required type="text" onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="e.g. Captain John" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                        <input required type="email" onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="coach@example.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
                        <input required type="password" onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="••••••••" />
                    </div>

                    {/* Fake Card UI */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4 opacity-70 select-none">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest">CREDIT CARD</span>
                            <div className="flex gap-1">
                                <div className="w-6 h-4 bg-red-400 rounded-sm"></div>
                                <div className="w-6 h-4 bg-yellow-400 rounded-sm"></div>
                            </div>
                        </div>
                        <div className="font-mono text-slate-400 text-sm mb-2 tracking-widest">4242 4242 4242 4242</div>
                        <div className="flex gap-4 font-mono text-xs text-slate-400">
                            <span>12/28</span>
                            <span>123</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : `Pay & Join Now`}
                    </button>

                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        *Test Mode: No real payment required.
                    </p>
                </form>
            </div>
        </div>
    );
}