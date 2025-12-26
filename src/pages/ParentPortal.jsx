import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

export default function ParentPortal() {
    // Mock Data
    const child = { name: "Ahmed", level: "Silver", nextClass: "Monday, 5:00 PM", location: "Sharjah Branch" };
    const paymentStatus = "unpaid"; // or 'paid'

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-emerald-500 pt-12 pb-24 px-6 rounded-b-[40px] shadow-lg shadow-emerald-200">
                <div className="flex items-center justify-between text-white">
                    <div>
                        <h1 className="text-3xl font-black mb-1">{child.name}</h1>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-sm border border-white/30">
                            {child.level} Gymnast
                        </span>
                    </div>
                    <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center text-emerald-500 font-bold text-xl shadow-inner">
                        {child.name.charAt(0)}
                    </div>
                </div>
            </div>

            {/* Widgets Grid */}
            <div className="px-6 -mt-16 space-y-4">

                {/* Progress Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Progress</h3>
                        <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md mb-0">Top 10%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-emerald-500" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-slate-900 text-lg">85%</div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 italic">"Great improvement in balance beam dismounts this week!"</p>
                            <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Coach Sarah</div>
                        </div>
                    </div>
                </div>

                {/* Schedule Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Next Class</h3>
                        <p className="text-slate-600 font-medium">{child.nextClass}</p>
                        <p className="text-xs text-slate-400">@ {child.location}</p>
                    </div>
                </div>

                {/* Payment Status */}
                <div className={clsx("p-6 rounded-2xl shadow-sm border flex items-center justify-between", paymentStatus === 'paid' ? "bg-white border-emerald-500/20" : "bg-red-50 border-red-100")}>
                    <div>
                        <h3 className={clsx("font-bold text-sm", paymentStatus === 'paid' ? "text-slate-900" : "text-red-700")}>
                            {paymentStatus === 'paid' ? 'Active Membership' : 'Renewal Due'}
                        </h3>
                        <p className={clsx("text-xs mt-1", paymentStatus === 'paid' ? "text-slate-500" : "text-red-500")}>
                            {paymentStatus === 'paid' ? 'Valid until March 30, 2026' : 'Term 1 Fees Pending'}
                        </p>
                    </div>
                    {paymentStatus === 'unpaid' ? (
                        <NavLink to="/payment" className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-red-200 hover:bg-red-600 transition-colors">
                            Pay Now
                        </NavLink>
                    ) : (
                        <span className="material-symbols-outlined text-emerald-500">verified</span>
                    )}
                </div>

            </div>
        </div>
    );
}
