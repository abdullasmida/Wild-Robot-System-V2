import React from 'react';
import { clsx } from 'clsx';

export default function Analytics() {
    return (
        <div className="p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
                <p className="text-slate-500 font-medium">Platform Growth & Performance Metrics</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Students', value: '1,240', trend: '+12%', color: 'bg-indigo-500' },
                    { label: 'Monthly Revenue', value: 'AED 450k', trend: '+8%', color: 'bg-emerald-500' },
                    { label: 'Retention Rate', value: '94%', trend: '-1%', color: 'bg-orange-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className={clsx("absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110", stat.color)} />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-slate-800">{stat.value}</span>
                            <span className={clsx("text-xs font-bold px-2 py-1 rounded-full", stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-indigo-500">bar_chart</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Detailed Charts Coming Soon</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    We are building enhanced visualization tools to track growth per branch and discipline.
                </p>
            </div>
        </div>
    );
}
