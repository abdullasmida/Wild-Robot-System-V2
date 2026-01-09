import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react';

const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
    </div>
);

const FinanceDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
                <p className="text-slate-500">Track revenue, payroll, and expenses.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="AED 124,500"
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Net Profit"
                    value="AED 45,200"
                    trend="+8%"
                    trendUp={true}
                    icon={TrendingUp}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending Payments"
                    value="AED 12,800"
                    trend="Requires Action"
                    trendUp={false}
                    icon={CreditCard}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Next Payroll"
                    value="In 12 Days"
                    icon={Calendar}
                    color="bg-purple-500"
                />
            </div>

            {/* Placeholder for Charts/Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96 flex items-center justify-center">
                    <p className="text-slate-400 font-medium">Revenue Chart Coming Soon</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96 flex items-center justify-center">
                    <p className="text-slate-400 font-medium">Recent Transactions</p>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
