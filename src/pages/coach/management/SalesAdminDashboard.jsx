import React, { useState } from 'react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export default function SalesAdminDashboard() {
    // --- Mock Data ---
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Follow up Payment: Sarah S.', priority: 'high', status: 'todo' },
        { id: 2, title: 'Order Water Bottles', priority: 'medium', status: 'todo' },
        { id: 3, title: 'Birthday Gift: Ali M.', priority: 'low', status: 'in_progress' }
    ]);
    const [attendanceQuery, setAttendanceQuery] = useState('');
    const [studentStatus, setStudentStatus] = useState(null);

    // --- Gatekeeper Logic ---
    const handleSearch = (e) => {
        const q = e.target.value;
        setAttendanceQuery(q);
        if (q.toLowerCase() === 'sarah') {
            setStudentStatus({ name: 'Sarah Smith', status: 'expired', level: 'Gold' });
        } else if (q.toLowerCase() === 'ali') {
            setStudentStatus({ name: 'Ali Mansoor', status: 'active', level: 'Silver' });
        } else {
            setStudentStatus(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto min-h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Operations Commander</h1>
                    <p className="text-slate-500 font-bold">Front Desk & Sales Control</p>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">payments</span>
                    Today: AED 4,250
                </div>
            </div>

            {/* --- The Gatekeeper Module --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                {/* Scanner / Search */}
                <div className="bg-slate-900 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-9xl text-white">qr_code_scanner</span>
                    </div>
                    <label className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">Live Scanner</label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Type Name or Scan ID..."
                            value={attendanceQuery}
                            onChange={handleSearch}
                            className="bg-slate-800 border-none text-white placeholder-slate-500 text-xl font-bold rounded-xl px-6 py-4 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                            autoFocus
                        />
                    </div>
                    {/* Recent Scans */}
                    <div className="mt-8 space-y-3">
                        <p className="text-slate-500 text-xs font-bold uppercase">Recent Check-ins</p>
                        <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                            <span className="font-bold text-sm">John Doe</span>
                            <span className="text-xs text-slate-500 ml-auto">16:02</span>
                        </div>
                    </div>
                </div>

                {/* Status Result */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm relative">
                    {!studentStatus ? (
                        <div className="text-slate-300 flex flex-col items-center">
                            <span className="material-symbols-outlined text-6xl mb-4">person_search</span>
                            <h3 className="text-xl font-bold">Waiting for input...</h3>
                        </div>
                    ) : (
                        studentStatus.status === 'active' ? (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 mx-auto">
                                    <span className="material-symbols-outlined text-5xl">check</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-1">{studentStatus.name}</h2>
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Subscription Active</span>
                                <p className="text-slate-500 mt-4 font-medium">Enjoy your session!</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in duration-300 w-full">
                                <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
                                    <span className="material-symbols-outlined text-5xl">block</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-1">{studentStatus.name}</h2>
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Payment Overdue</span>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">
                                        View Profile
                                    </button>
                                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-lg">payments</span>
                                        Pay & Unlock
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* --- Lower Section: Task Matrix & Pro POS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Task Matrix (Kanban-lite) */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">view_kanban</span>
                            Task Matrix
                        </h3>
                        <button className="text-indigo-600 text-xs font-bold hover:underline">+ New Task</button>
                    </div>
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group cursor-move">
                                <span className={clsx("h-3 w-3 rounded-full",
                                    task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                )}></span>
                                <span className="font-bold text-slate-700">{task.title}</span>
                                <span className="text-xs font-bold uppercase text-slate-400 ml-auto group-hover:hidden">{task.status.replace('_', ' ')}</span>
                                <div className="ml-auto hidden group-hover:flex gap-2">
                                    <button className="p-1 hover:bg-emerald-100 text-emerald-600 rounded"><span className="material-symbols-outlined text-lg">check</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pro POS Widget */}
                <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 h-40 w-40 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
                    <h3 className="text-lg font-black mb-6 relative z-10 flex items-center gap-2">
                        <span className="material-symbols-outlined">point_of_sale</span>
                        Pro POS
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                        <button className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                            <span className="text-2xl">👕</span>
                            <span className="text-xs font-bold">Uniform</span>
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                            <span className="text-2xl">💧</span>
                            <span className="text-xs font-bold">Water</span>
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                            <span className="text-2xl">📅</span>
                            <span className="text-xs font-bold">Monthly</span>
                        </button>
                        <button className="bg-emerald-500 hover:bg-emerald-400 text-white border-none p-4 rounded-xl flex flex-col items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                            <span className="material-symbols-outlined text-2xl">add</span>
                            <span className="text-xs font-bold">Custom</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-indigo-200 relative z-10">
                        <span>Auto-Receipt (WhatsApp)</span>
                        <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
