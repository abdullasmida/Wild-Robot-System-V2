import React, { useState } from 'react';
import { clsx } from 'clsx';
import InvoiceDetailModal from '../../components/InvoiceDetailModal';

export default function StudentBilling() {
    // Mock Data and Logic
    const [balance, setBalance] = useState(150.00);
    const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [invoices, setInvoices] = useState([
        { id: 'INV-001', date: '2024-12-01', description: 'Winter Term Fee', amount: 150.00, status: 'Pending' },
        { id: 'INV-002', date: '2024-11-01', description: 'Uniform Kit', amount: 85.00, status: 'Paid' },
        { id: 'INV-003', date: '2024-10-01', description: 'October Tuition', amount: 120.00, status: 'Paid' },
    ]);

    const handlePayNow = () => {
        setShowPaymentOverlay(true);
        // Simulate gateway interaction
        setTimeout(() => {
            // Success Logic
            setBalance(0);

            // Update Invoices: Mark all 'Pending' as 'Paid'
            setInvoices(prev => prev.map(inv =>
                inv.status === 'Pending' ? { ...inv, status: 'Paid' } : inv
            ));

            // If an invoice is currently open and was pending, update it too so the modal reflects the change immediately
            if (selectedInvoice && selectedInvoice.status === 'Pending') {
                setSelectedInvoice(prev => ({ ...prev, status: 'Paid' }));
            }

            setShowPaymentOverlay(false);

            // Simple toast simulation
            const toast = document.createElement('div');
            toast.textContent = 'Payment Successful! 🎉';
            toast.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in zoom-in-95 font-black text-xl z-[100]';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);

            // Ideally update invoice status here too in a real app
        }, 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto relative">
            <h1 className="text-2xl font-black text-slate-900">Billing & Payments</h1>

            {/* Status Card */}
            <div className={clsx(
                "rounded-3xl p-8 shadow-sm text-white transition-all duration-500",
                balance > 0 ? "bg-gradient-to-br from-red-500 to-orange-600 shadow-orange-200" : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200"
            )}>
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-white/80 font-medium mb-1">Current Balance</p>
                        <h2 className="text-4xl font-black">${balance.toFixed(2)}</h2>
                    </div>
                    <div
                        onClick={() => {
                            const toast = document.createElement('div');
                            toast.textContent = 'Manage Saved Cards feature coming soon! 💳';
                            toast.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 font-bold z-[200] text-sm';
                            document.body.appendChild(toast);
                            setTimeout(() => toast.remove(), 2500);
                        }}
                        className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                    </div>
                </div>

                {balance > 0 ? (
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-red-50 bg-red-900/20 px-3 py-1.5 rounded-lg w-fit">
                            <span className="material-symbols-outlined text-sm">error</span>
                            <span className="text-xs font-bold uppercase tracking-wide">Payment Due</span>
                        </div>
                        <button
                            onClick={handlePayNow}
                            className="w-full bg-white text-red-600 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                        >
                            <span>Pay Now</span>
                            <span className="material-symbols-outlined">credit_card</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                        <span className="font-bold text-lg">All caught up! 🎉</span>
                    </div>
                )}
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Invoice History</h3>
                    {invoices.length >= 5 && (
                        <button className="text-sm text-blue-500 font-bold hover:underline">View All</button>
                    )}
                </div>

                <div className="divide-y divide-slate-50">
                    {invoices.slice(0, 5).map((invoice, index) => (
                        <div
                            key={invoice.id}
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                    invoice.status === 'Paid' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                                )}>
                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{invoice.description}</p>
                                    <p className="text-xs text-slate-400">{invoice.date}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={clsx(
                                    "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider hidden sm:inline-block",
                                    invoice.status === 'Pending' ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {invoice.status}
                                </span>
                                <span className="font-bold text-slate-800 text-sm w-16 text-right">${invoice.amount}</span>
                                <button className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-center text-xs text-slate-400">
                Payments secured by Stripe. Encrypted via 256-bit SSL.
            </p>

            <InvoiceDetailModal
                invoice={selectedInvoice}
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            {/* Full Screen Payment Overlay */}
            {showPaymentOverlay && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="h-16 w-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Connecting to Stripe</h2>
                    <p className="text-slate-500 font-medium">Please verify your payment details...</p>
                </div>
            )}
        </div>
    );
}
