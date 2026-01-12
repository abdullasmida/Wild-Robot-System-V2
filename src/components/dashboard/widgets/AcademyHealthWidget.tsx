import React from 'react';
import { Activity, Zap } from 'lucide-react';

const AcademyHealthWidget = () => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Academy Health
                </h2>
                <div className="flex items-center gap-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700 ml-1">Live Information</span>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Active Members</p>
                            <p className="text-xs text-slate-500">Currently enrolled athletes</p>
                        </div>
                    </div>
                    <span className="text-xl font-black text-slate-900">142</span>
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Attendance Rate</p>
                            <p className="text-xs text-slate-500">Last 30 days average</p>
                        </div>
                    </div>
                    <span className="text-xl font-black text-slate-900">94%</span>
                </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-500 text-center">
                    System operating normally. Next payroll in 12 days.
                </div>
            </div>
        </div>
    );
};

export default AcademyHealthWidget;
