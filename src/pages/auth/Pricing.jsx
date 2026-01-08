import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X, Trophy, Briefcase, Calculator } from 'lucide-react'; // Using Lucide as it is installed

export default function Pricing() {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' or 'yearly'
    const [activeHub, setActiveHub] = useState('coaching'); // 'coaching' or 'management'

    // The "Math" Logic: 18% discount for yearly
    const calculatePrice = (basePrice) => {
        if (basePrice === 0) return 0;
        return billingCycle === 'yearly' ? Math.round(basePrice * 0.82) : basePrice;
    };

    const plans = [
        {
            name: "Starter",
            description: "Perfect for new independent coaches.",
            price: 0,
            features: {
                coaching: ["Up to 10 Athletes", "Basic Scheduling", "Attendance Tracking", "Mobile App Access"],
                management: ["Basic Revenue Tracking", "1 Staff Member", "Simple Reports"]
            },
            color: "bg-slate-50 text-slate-900 border-slate-200",
            buttonColor: "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50",
            popular: false
        },
        {
            name: "Pro",
            description: "For growing academies needing automation.",
            price: 29, // $29 monthly base
            features: {
                coaching: ["Up to 50 Athletes", "Video Analysis", "Performance Evals", "Parent Portal"],
                management: ["Automated Invoicing", "Up to 5 Staff", "Payroll Integration", "Custom Branding"]
            },
            color: "bg-white text-slate-900 ring-2 ring-blue-600 shadow-xl", // Highlighted
            buttonColor: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200",
            popular: true
        },
        {
            name: "Elite",
            description: "Full control for large competitive clubs.",
            price: 99,
            features: {
                coaching: ["Unlimited Athletes", "Advanced Analytics", "Tournament Planner", "Live Streaming Support"],
                management: ["Advanced Financials", "Unlimited Staff", "Multi-Branch Support", "Dedicated Success Manager"]
            },
            color: "bg-slate-900 text-white border-slate-800",
            buttonColor: "bg-white text-slate-900 hover:bg-slate-100",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
            {/* --- HEADER --- */}
            <div className="text-center pt-20 pb-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Pricing that grows <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            with your ambition.
                        </span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Start for free, upgrade when you win. No hidden fees. <br />
                        <span className="font-semibold text-slate-900">14-day free trial on all paid plans.</span>
                    </p>
                </motion.div>
            </div>

            {/* --- CONTROLS SECTION --- */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 border-b border-slate-100 mb-12">
                <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* HUB SWITCHER (Coaching vs Management) */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveHub('coaching')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeHub === 'coaching'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Trophy className="w-4 h-4" />
                            Coaching Hub
                        </button>
                        <button
                            onClick={() => setActiveHub('management')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeHub === 'management'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            Management Hub
                        </button>
                    </div>

                    {/* BILLING TOGGLE */}
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className={`relative w-14 h-8 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <motion.div
                                layout
                                className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md"
                                animate={{ x: billingCycle === 'yearly' ? 24 : 0 }}
                            />
                        </button>
                        <span className={`text-sm font-bold flex items-center gap-1 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
                            Yearly
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                -18%
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* --- PRICING CARDS --- */}
            <div className="max-w-7xl mx-auto px-4 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative rounded-3xl p-8 flex flex-col ${plan.color} ${plan.popular ? 'z-10 transform md:-translate-y-4' : 'border'}`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border-4 border-white">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <p className={`text-sm leading-relaxed opacity-80 h-10`}>{plan.description}</p>
                        </div>

                        {/* PRICE DISPLAY */}
                        <div className="mb-8 pl-2 border-l-4 border-current/20">
                            <div className="flex items-end gap-2">
                                {/* Strikethrough Logic */}
                                {billingCycle === 'yearly' && plan.price > 0 && (
                                    <span className="text-xl line-through decoration-red-500 decoration-2 opacity-50 font-bold mb-1">
                                        ${plan.price}
                                    </span>
                                )}
                                <span className="text-5xl font-black tracking-tight">
                                    ${calculatePrice(plan.price)}
                                </span>
                            </div>
                            <span className="text-sm font-bold opacity-60 block mt-1">
                                per seat / month
                                {billingCycle === 'yearly' && ' (billed annually)'}
                            </span>
                        </div>

                        {/* CTA BUTTON */}
                        <button
                            onClick={() => navigate('/signup')}
                            className={`w-full py-4 rounded-xl font-bold mb-8 transition-transform active:scale-95 text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${plan.buttonColor}`}
                        >
                            Start Free Trial
                            <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                        </button>

                        {/* FEATURES LIST */}
                        <div className="space-y-4 flex-1">
                            <p className="text-xs font-bold uppercase opacity-60 tracking-wider mb-4 border-b border-current/10 pb-2">
                                What's included in {activeHub}:
                            </p>

                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeHub}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-3"
                                >
                                    {(activeHub === 'coaching' ? plan.features.coaching : plan.features.management).map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`p-1 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-medium opacity-90">{feature}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* TRUST INDICATORS */}
            <div className="bg-slate-50 py-16 border-t border-slate-200">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <p className="text-sm font-bold text-slate-400 mb-8 tracking-widest uppercase">Trusted by 500+ top academies</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale mix-blend-multiply">
                        {/* Placeholder Company Logos */}
                        {['ACME Sport', 'Elite Training', 'Global Soccer', 'Pro Tennis', 'Jump Start'].map(company => (
                            <span key={company} className="text-xl font-black text-slate-800">{company}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
