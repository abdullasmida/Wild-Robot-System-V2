import React from 'react';

export default function FinanceDashboard() {
    return (
        <div className="p-8 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance Overview</h1>
                    <p className="text-slate-500 font-medium">Accounting & Payroll</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white text-slate-600 px-4 py-2 rounded-lg font-bold border border-slate-200 hover:bg-slate-50 text-sm">
                        Export Report
                    </button>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span>
                        New Invoice
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Card */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">payments</span>
                        Revenue Stream
                    </h3>
                    <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 border-dashed">
                        <p className="text-slate-400 text-sm font-medium">Chart Visualization Placeholder</p>
                    </div>
                </div>

                {/* Payroll Card */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">badge</span>
                        Pending Payroll
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-200 rounded-full" />
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Coach Employee #{i}</p>
                                        <p className="text-xs text-slate-400">Mar 2025 Salary</p>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-slate-700">AED 8,500</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition-colors">
                        Process All Payments
                    </button>
                </div>
            </div>
        </div>
    );
}
