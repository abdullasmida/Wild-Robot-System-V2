import React from 'react';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-[200px]">
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-xl ${color} bg-opacity-10 text-white`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
);

const FinancialOverviewWidget = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Financial Overview
                </h2>
                <button
                    onClick={() => navigate('/workspace/finance')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                    View Full Report
                </button>
            </div>

            <div className="flex flex-wrap gap-4">
                <StatCard
                    title="Revenue (Mtd)"
                    value="AED 42,500"
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Net Profit"
                    value="AED 15,200"
                    trend="+8%"
                    trendUp={true}
                    icon={TrendingUp}
                    color="bg-blue-500"
                />
            </div>
        </div>
    );
};

export default FinancialOverviewWidget;
