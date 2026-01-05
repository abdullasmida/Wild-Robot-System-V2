import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title = "Under Construction" }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10 border border-slate-700">
                <Construction className="w-10 h-10 text-emerald-500" />
            </div>

            <h2 className="text-3xl font-bold text-slate-100 mb-3 tracking-tight">{title}</h2>
            <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
                We are currently building this module to help you manage your academy better.
                Check back soon for updates!
            </p>

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all hover:scale-105 border border-slate-700"
            >
                <ArrowLeft className="w-4 h-4" />
                Go Back
            </button>
        </div>
    );
};

export default ComingSoon;
