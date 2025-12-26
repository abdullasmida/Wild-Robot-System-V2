import React from 'react';
import { clsx } from 'clsx';

export default function PaymentGateway() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Left Side: Invoice */}
            <div className="w-full md:w-5/12 bg-white p-8 border-r border-gray-100">
                <div className="max-w-md mx-auto h-full flex flex-col">
                    <div className="mb-8">
                        <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                            <span className="material-symbols-outlined text-2xl">receipt_long</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-1">Wild Robot Invoice #1024</h2>
                        <p className="text-slate-500 text-sm">Issued Date: Dec 15, 2025</p>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                                <h3 className="font-bold text-slate-800">Gymnastics Term 1</h3>
                                <p className="text-xs text-slate-500">Membership Fee (Jan - Mar)</p>
                            </div>
                            <span className="font-bold text-slate-900">500 AED</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                                <h3 className="font-bold text-slate-800">Uniform Kit</h3>
                                <p className="text-xs text-slate-500">Premium Leotard (Size M)</p>
                            </div>
                            <span className="font-bold text-slate-900">150 AED</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-slate-500 font-medium">Total Amount</span>
                            <span className="text-3xl font-black text-slate-900">650 AED</span>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Have a promo code?"
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold placeholder-slate-400 text-slate-800"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-3 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors">Apply</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Checkout */}
            <div className="w-full md:w-7/12 bg-gray-50 p-8">
                <div className="max-w-md mx-auto">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Select Payment Method</h2>

                    <div className="space-y-4 mb-8">
                        <PaymentMethodCard icon="credit_card" title="Credit / Debit Card" sub="Visa, Mastercard, Amex" active />
                        <PaymentMethodCard icon="phone_iphone" title="Apple Pay" sub="Faster checkout" />
                        <PaymentMethodCard icon="pie_chart" title="Tabby" sub="Split in 4 payments" color="text-green-600" />
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Saved Cards</h3>
                        <div className="p-4 bg-white border border-emerald-500 ring-4 ring-emerald-500/10 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-16 bg-blue-900 rounded-lg flex items-center justify-center text-white italic font-serif font-bold text-xs">VISA</div>
                                <div>
                                    <p className="font-bold text-slate-900">•••• 4242</p>
                                    <p className="text-xs text-slate-500">Expires 12/28</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        </div>
                    </div>

                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                        Pay AED 650
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified_user</span>
                        Payments are secure and encrypted.
                    </p>
                </div>
            </div>
        </div>
    );
}

function PaymentMethodCard({ icon, title, sub, active, color }) {
    return (
        <button className={clsx(
            "w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all",
            active ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500" : "bg-white border-gray-100 hover:border-gray-300 text-slate-400"
        )}>
            <div className={clsx("h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center", active ? "text-emerald-600" : "text-slate-400")}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div className="flex-1">
                <h3 className={clsx("font-bold", active ? "text-slate-900" : "text-slate-500", color)}>{title}</h3>
                <p className="text-xs text-slate-400">{sub}</p>
            </div>
            <div className={clsx("h-5 w-5 rounded-full border-2 flex items-center justify-center", active ? "border-emerald-500" : "border-gray-200")}>
                {active && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>}
            </div>
        </button>
    );
}
