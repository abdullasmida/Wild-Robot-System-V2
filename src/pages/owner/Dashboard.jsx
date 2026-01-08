import React from 'react';
import { useUser } from '@/context/UserContext';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { profile } = useUser();
    const firstName = profile?.full_name?.split(' ')[0] || 'Owner';

    // SAFE MODE: Fallback execution if data is missing
    const academyName = profile?.academy_name || "Test Kingdom";

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header / Welcome */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-200">
                <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}.</h1>
                <p className="opacity-90 font-medium text-lg">Ready to manage {academyName}?</p>
            </div>

            {/* DASHBOARD CONTENT (Forced Render) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Total Staff</h3>
                    <p className="text-3xl font-black text-slate-800">12</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Active Athletes</h3>
                    <p className="text-3xl font-black text-slate-800">148</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Monthly Revenue</h3>
                    <p className="text-3xl font-black text-emerald-600">AED 45.2k</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
