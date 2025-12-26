import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useLocation } from 'react-router-dom';

export default function SubscriptionPlans() {
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
    const location = useLocation();
    const shouldHighlightTeam = location.state?.highlight === 'team';

    useEffect(() => {
        if (shouldHighlightTeam) {
            // Optional: Scroll to team plan on mobile
            const teamElement = document.getElementById('plan-team');
            if (teamElement) teamElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [shouldHighlightTeam]);

    const plans = [
        {
            id: 'freelancer',
            name: "Freelancer",
            // ... (rest of code logic remains similar, but need to be careful with replace)
            // Actually, easier to simple replace the start of function and where 'recommended' is defined

            price: 0,
            period: '/mo',
            description: "Perfect for solo coaches starting out.",
            features: [
                "Up to 50 Athletes",
                "Basic Schedule Management",
                "Personal Coach Profile",
                "Standard Support"
            ],
            buttonLabel: "Current Plan",
            buttonStyle: "secondary",
            recommended: false
        },
        {
            id: 'team',
            name: "Team",
            price: billingCycle === 'monthly' ? 49 : 470,
            period: billingCycle === 'monthly' ? '/mo' : '/yr',
            description: "For growing academies & small clubs.",
            features: [
                "Unlimited Athletes",
                "5 Staff Accounts",
                "Financial Reports & Invoicing",
                "Attendance Tracking",
                "Priority Support"
            ],
            buttonLabel: "Upgrade Now",
            buttonStyle: "primary",
            recommended: true, // Always recommended, but we can check shouldHighlightTeam for extra effects in the render
            isHighlightTarget: shouldHighlightTeam // Custom flag for extra visual flair
        },
        {
            id: 'enterprise',
            name: "Enterprise",
            price: "Custom",
            period: '',
            description: "For large clubs & franchises.",
            features: [
                "Multi-Branch Management",
                "White Labeling (Custom Branding)",
                "Dedicated Account Manager",
                "API Access",
                "SSO & Advanced Security"
            ],
            buttonLabel: "Contact Sales",
            buttonStyle: "outline",
            recommended: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Choose the plan that fits your growth.
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Scale your academy with tools designed for every stage of your journey. No hidden fees. Cancel anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="mt-8 flex justify-center items-center gap-3">
                        <span className={clsx("text-sm font-bold", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-400")}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className={clsx(
                                "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none",
                                billingCycle === 'yearly' ? "bg-emerald-500" : "bg-slate-300"
                            )}
                        >
                            <span
                                className={clsx(
                                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm",
                                    billingCycle === 'yearly' ? "translate-x-7" : "translate-x-1"
                                )}
                            />
                        </button>
                        <span className={clsx("text-sm font-bold flex items-center gap-2", billingCycle === 'yearly' ? "text-slate-900" : "text-slate-400")}>
                            Yearly
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Save 20%</span>
                        </span>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            id={`plan-${plan.id}`}
                            className={clsx(
                                "relative flex flex-col p-8 bg-white rounded-3xl shadow-sm border transition-all hover:shadow-xl",
                                plan.recommended ? "border-emerald-500 ring-4 ring-emerald-500/10 z-10 scale-105" : "border-gray-100 hover:border-emerald-200",
                                plan.isHighlightTarget && "animate-pulse-border ring-emerald-500/50 shadow-2xl shadow-emerald-500/20"
                            )}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-emerald-200">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                <p className="text-sm text-slate-500 mt-2 h-10">{plan.description}</p>
                            </div>

                            <div className="mb-6 flex items-baseline gap-1">
                                {typeof plan.price === 'number' ? (
                                    <>
                                        <span className="text-5xl font-black text-slate-900">${plan.price}</span>
                                        <span className="text-slate-500 font-medium">{plan.period}</span>
                                    </>
                                ) : (
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                )}
                            </div>

                            <ul className="mb-8 space-y-4 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={clsx(
                                    "w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                                    plan.buttonStyle === 'primary'
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02]"
                                        : plan.buttonStyle === 'outline'
                                            ? "bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50"
                                            : "bg-gray-100 text-slate-500 cursor-default"
                                )}
                                disabled={plan.buttonStyle === 'secondary'}
                            >
                                {plan.buttonLabel}
                                {plan.buttonStyle !== 'secondary' && (
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ / Trust Hints (Optional) */}
                <div className="mt-16 border-t border-gray-200 pt-8 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Trusted by 500+ academies worldwide.
                        <span className="mx-2">•</span>
                        Secure payments by Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
}
