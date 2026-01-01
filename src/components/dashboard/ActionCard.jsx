import React from 'react';

const ActionCard = ({ title, desc, icon: Icon, color, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left group w-full"
    >
        <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </button>
);

export default ActionCard;
