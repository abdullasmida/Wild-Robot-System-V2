import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full">
                <div className="text-8xl mb-4 transform rotate-12 inline-block">🛸</div>
                <h1 className="text-6xl font-black text-slate-900 mb-2">404</h1>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Lost in Space?</h2>
                <p className="text-slate-500 mb-8 font-medium">
                    The page you are looking for has drifted away or doesn't exist.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/coach/home')}
                        className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        Return to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-white border-2 border-slate-200 text-slate-600 px-6 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
