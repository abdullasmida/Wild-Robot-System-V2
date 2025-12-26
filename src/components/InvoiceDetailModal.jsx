import React from 'react';
import { clsx } from 'clsx';

export default function InvoiceDetailModal({ invoice, isOpen, onClose }) {
    if (!isOpen || !invoice) return null;

    // Mock Line Items based on invoice description
    const lineItems = [
        { description: invoice.description, amount: invoice.amount },
        { description: 'Transaction Fee', amount: 0.00 }, // Mock
    ];


    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        // Simulate download
        setTimeout(() => {
            setIsDownloading(false);
            const toast = document.createElement('div');
            toast.textContent = 'Invoice downloaded successfully 📄';
            toast.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 font-bold z-[200] flex items-center gap-2';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Invoice #{invoice.id}</h2>
                        <span className={clsx(
                            "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide mt-1 inline-block",
                            invoice.status === 'Paid' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                        )}>
                            {invoice.status}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400 text-sm">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-slate-500 mb-6">
                            <span>Billed to: <strong>Student Account</strong></span>
                            <span>Date: <strong>{invoice.date}</strong></span>
                        </div>

                        {/* Table Header */}
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                            <span>Description</span>
                            <span>Amount</span>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {lineItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-slate-700 font-medium">{item.description}</span>
                                    <span className="text-slate-900 font-bold">${item.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-4">
                            <span className="font-black text-slate-800 text-lg">Total</span>
                            <span className="font-black text-slate-900 text-xl">${invoice.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        {isDownloading ? (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">download</span>
                        )}
                        <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                    </button>
                    {invoice.status === 'Pending' && (
                        <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
                            Pay Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
