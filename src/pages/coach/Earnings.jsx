import React from 'react';

const MyEarnings = () => {
    // Mock Data (Future: Link to payrolls table)
    const earnings = {
        total: 5850,
        currency: 'AED',
        breakdown: {
            hours_worked: 82,
            hourly_rate: 50,
            base_pay: 4100, // 82 * 50
        },
        private_sessions: {
            count: 7, // Count of private sessions
            rate: 250, // Rate per private session
            total: 1750 // 7 * 250
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">account_balance_wallet</span>
                My Financial Hub
            </h1>

            {/* 1. Main Balance Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium mb-1">Estimated Payout (This Month)</p>
                    <div className="text-5xl font-bold mb-4 flex items-baseline gap-2">
                        {earnings.total.toLocaleString()} <span className="text-lg text-emerald-400">{earnings.currency}</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-medium backdrop-blur">
                            Next Payout: <span className="text-white font-bold">01 Jan 2026</span>
                        </div>
                    </div>
                </div>
                {/* Decor */}
                <span className="material-symbols-outlined absolute right-4 bottom-4 text-emerald-500/20 text-[120px] leading-none select-none">trending_up</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

                {/* 2. Regular Classes Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">calendar_today</span>
                        </div>
                        <h3 className="font-bold text-slate-700">Regular Classes</h3>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{earnings.breakdown.hours_worked}</p>
                            <p className="text-xs text-slate-500">Hours Logged</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600">+{earnings.breakdown.base_pay} AED</p>
                            <p className="text-xs text-slate-400">@ {earnings.breakdown.hourly_rate} AED/hr</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[75%]"></div>
                    </div>
                </div>

                {/* 3. Private Sessions (The Gold Mine) */}
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-200 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-amber-800">
                        HIGH VALUE
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-amber-200 p-2 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-700">workspace_premium</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">Private Commissions</h3>
                            <p className="text-xs text-amber-600">Personal Training Bonus</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-amber-100 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-[20px]">bolt</span>
                            <span className="font-bold text-slate-700">{earnings.private_sessions.count} Sessions</span>
                        </div>
                        <span className="font-bold text-emerald-600">+{earnings.private_sessions.total} AED</span>
                    </div>

                    <p className="text-xs text-center text-amber-700/70 mt-2">
                        Keep it up! Each private session adds significant value.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default MyEarnings;
