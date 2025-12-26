import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LoginSelection() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in, redirect to home if so
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/coach/home');
            }
        });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-300 mb-6">
                        <span className="material-symbols-outlined text-[36px]">smart_toy</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Welcome to Wild Robot 🤖
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Select your portal to continue.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

                    {/* Staff Card */}
                    <Link
                        to="/coach/home" // Redirecting to new Coach Portal
                        className="group relative flex flex-col items-center text-center p-8 bg-white rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                        <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[40px]">business_center</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Staff & Coaches</h2>
                        <p className="text-slate-500 mb-6">Manage academy, schedule, and revenue.</p>
                        <span className="mt-auto inline-flex items-center text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                            Enter Portal <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                        </span>
                    </Link>

                    {/* Student Card */}
                    <Link
                        to="/student"
                        className="group relative flex flex-col items-center text-center p-8 bg-white rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                        aria-label="Student Portal: Book classes, view attendance, and pay fees."
                        role="listitem"
                    >
                        <div className="h-20 w-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[40px]">backpack</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Portal</h2>
                        <p className="text-slate-500 mb-6">Book classes, view attendance, and pay fees.</p>
                        <span className="mt-auto inline-flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                            Enter Portal <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                        </span>
                    </Link>

                </div>

                <div className="mt-12 text-center text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} Wild Robot Academy. All rights reserved.
                </div>
            </div>
        </div>
    );
}
