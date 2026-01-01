import React from 'react';
import { CheckCircle, Square } from 'lucide-react';

const ChecklistWidget = ({ title, desc, icon: Icon, isCompleted, onClick }) => (
    <div
        onClick={!isCompleted ? onClick : undefined}
        className={`relative p-6 rounded-2xl border-2 transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-white border-slate-100 hover:border-emerald-500 cursor-pointer hover:shadow-lg'}`}
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="w-6 h-6" />
            </div>
            {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-emerald-500" />
            ) : (
                <Square className="w-6 h-6 text-slate-200" />
            )}
        </div>
        <h3 className={`font-bold text-lg mb-1 ${isCompleted ? 'text-emerald-800 line-through decoration-emerald-500/50' : 'text-slate-900'}`}>{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
    </div>
);

export default ChecklistWidget;
