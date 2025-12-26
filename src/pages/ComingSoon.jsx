import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border border-slate-200 border-dashed">
            <div className="bg-slate-100 p-6 rounded-full mb-6 relative">
                <span className="material-symbols-outlined text-6xl text-slate-300">construction</span>
                <div className="absolute bottom-0 right-0 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">WIP</div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Work in Progress</h2>
            <p className="text-slate-500 max-w-md mb-8 text-lg font-medium">
                We're building something amazing here. This feature will be available in the next major update.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm flex items-center gap-2"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                Go Back
            </button>
        </div>
    );
}
