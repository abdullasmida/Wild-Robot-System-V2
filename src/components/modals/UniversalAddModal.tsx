import React, { useState, Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { X, Upload, Plus, Trash2, Shield, User, Mail, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Dummy CSV parsing for now
const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { name: 'Alice Smith', email: 'alice@example.com', role: 'Coach' },
                { name: 'Bob Jones', email: 'bob@example.com', role: 'Head Coach' }
            ]);
        }, 1500);
    });
};

interface StaffRow {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    employmentType: 'full_time' | 'part_time';
    salary: string | number;
    dailyHoursLimit: string | number; // Input is string usually
    hourlyRate: string | number;
}

interface UniversalAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: number;
}

export default function UniversalAddModal({ isOpen, onClose, initialTab = 0 }: UniversalAddModalProps) {
    const [selectedTab, setSelectedTab] = useState(initialTab);
    const [manualRows, setManualRows] = useState<StaffRow[]>([
        { id: 1, firstName: '', lastName: '', email: '', role: 'Coach', employmentType: 'full_time', salary: '', dailyHoursLimit: 9, hourlyRate: '' }
    ]);
    const [importStatus, setImportStatus] = useState<'idle' | 'analyzing' | 'success'>('idle'); // idle, analyzing, success
    const [importedData, setImportedData] = useState<any[]>([]);

    // Manual Row Logic
    const addRow = () => {
        setManualRows([...manualRows, {
            id: Date.now(),
            firstName: '',
            lastName: '',
            email: '',
            role: 'Coach',
            employmentType: 'full_time',
            salary: '',
            dailyHoursLimit: 9,
            hourlyRate: ''
        }]);
    };

    const removeRow = (id: number) => {
        if (manualRows.length > 1) {
            setManualRows(manualRows.filter(row => row.id !== id));
        }
    };

    const updateRow = (id: number, field: keyof StaffRow, value: any) => {
        setManualRows(manualRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    // Import Logic
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportStatus('analyzing');
        const data = await parseCSV(file);
        setImportedData(data);
        setImportStatus('success');
    };

    // Submit Logic (Real API)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const rowsToProcess = selectedTab === 0 ? manualRows : importedData;

        console.log("Submitting Rows:", rowsToProcess);

        try {
            // Process invites sequentially (or Promise.all for parallel)
            let successCount = 0;
            let failCount = 0;

            for (const row of rowsToProcess) {
                // Skip empty rows
                if (!row.email || !row.firstName) continue;

                try {
                    const response = await fetch('/api/send-invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: row.email,
                            firstName: row.firstName, // Ensure your input uses 'firstName' or map it
                            role: row.role
                        })
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        // Attempted to parse error
                        const err = await response.json().catch(() => ({}));
                        console.error(`Failed to invite ${row.email}:`, err);
                        failCount++;
                    }
                } catch (error) {
                    console.error(`Network error for ${row.email}:`, error);
                    failCount++;
                }
            }

            if (successCount > 0) {
                // If we're using Sonner or similar toast
                // toast.success(`Sent ${successCount} invites!`);
                console.log(`Successfully sent ${successCount} invites.`);
                onClose();
            }

            if (failCount > 0) {
                // toast.error(`Failed to send ${failCount} invites.`);
                console.warn(`Failed to send ${failCount} invites.`);
            }

        } catch (err) {
            console.error("Global submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100">

                                {/* Header */}
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <User className="w-6 h-6 text-emerald-500" />
                                        Add Staff Members
                                    </Dialog.Title>
                                    <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                                        <Tab.List className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-6 max-w-sm">
                                            {['Manual Entry', 'Bulk Import'].map((category) => (
                                                <Tab
                                                    key={category}
                                                    className={({ selected }) =>
                                                        cn(
                                                            'w-full rounded-lg py-2.5 text-sm font-bold leading-5 transition-all',
                                                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2',
                                                            selected
                                                                ? 'bg-white text-emerald-700 shadow shadow-sm'
                                                                : 'text-slate-500 hover:bg-white/[0.12] hover:text-slate-700'
                                                        )
                                                    }
                                                >
                                                    {category}
                                                </Tab>
                                            ))}
                                        </Tab.List>

                                        <Tab.Panels>
                                            {/* Manual Entry Panel */}
                                            <Tab.Panel className="outline-none">
                                                <div className="space-y-4">
                                                    {/* Header Row */}
                                                    <div className="grid grid-cols-12 gap-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        <div className="col-span-3">First Name</div>
                                                        <div className="col-span-3">Last Name</div>
                                                        <div className="col-span-3">Email</div>
                                                        <div className="col-span-2">Role</div>
                                                        <div className="col-span-1"></div>
                                                    </div>

                                                    {/* Rows */}
                                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                                        {manualRows.map((row) => (
                                                            <div key={row.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                                                                {/* Top Row: Basic Info */}
                                                                <div className="grid grid-cols-12 gap-4 items-center">
                                                                    <div className="col-span-3">
                                                                        <input
                                                                            type="text"
                                                                            value={row.firstName}
                                                                            onChange={(e) => updateRow(row.id, 'firstName', e.target.value)}
                                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                                                            placeholder="First"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-3">
                                                                        <input
                                                                            type="text"
                                                                            value={row.lastName}
                                                                            onChange={(e) => updateRow(row.id, 'lastName', e.target.value)}
                                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                                                            placeholder="Last"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-3">
                                                                        <input
                                                                            type="email"
                                                                            value={row.email}
                                                                            onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                                                            placeholder="email@example.com"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <select
                                                                            value={row.role}
                                                                            onChange={(e) => updateRow(row.id, 'role', e.target.value)}
                                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                                                        >
                                                                            <option>Coach</option>
                                                                            <option>Head Coach</option>
                                                                            <option>Admin</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-span-1 flex justify-center">
                                                                        <button
                                                                            onClick={() => removeRow(row.id)}
                                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                            disabled={manualRows.length === 1}
                                                                        >
                                                                            <Trash2 className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Second Row: Contract Details */}
                                                                <div className="grid grid-cols-12 gap-4 items-end pt-2 border-t border-slate-200/50">
                                                                    {/* Employment Type */}
                                                                    <div className="col-span-4">
                                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Contract Type</label>
                                                                        <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                                                                            <button
                                                                                onClick={() => updateRow(row.id, 'employmentType', 'full_time')}
                                                                                className={cn(
                                                                                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                                                                                    row.employmentType === 'full_time'
                                                                                        ? "bg-emerald-100 text-emerald-700 shadow-sm"
                                                                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                                                                )}
                                                                            >
                                                                                Full Time
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateRow(row.id, 'employmentType', 'part_time')}
                                                                                className={cn(
                                                                                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                                                                                    row.employmentType === 'part_time'
                                                                                        ? "bg-amber-100 text-amber-700 shadow-sm"
                                                                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                                                                )}
                                                                            >
                                                                                Part Time
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Conditional Inputs */}
                                                                    {row.employmentType === 'full_time' ? (
                                                                        <>
                                                                            <div className="col-span-3">
                                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Monthly Salary</label>
                                                                                <div className="relative">
                                                                                    <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">AED</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={row.salary}
                                                                                        onChange={(e) => updateRow(row.id, 'salary', e.target.value)}
                                                                                        className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                                                                                        placeholder="0.00"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-span-3">
                                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Daily Contract Hrs</label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={row.dailyHoursLimit}
                                                                                    onChange={(e) => updateRow(row.id, 'dailyHoursLimit', e.target.value)}
                                                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                                                                                    placeholder="9"
                                                                                />
                                                                            </div>
                                                                            <div className="col-span-2 flex items-center h-full pb-2">
                                                                                <span className="text-[10px] leading-tight text-slate-400">
                                                                                    *Overtime triggers &gt; {row.dailyHoursLimit || 9}hrs
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="col-span-4">
                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hourly Rate</label>
                                                                            <div className="relative">
                                                                                <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">AED</span>
                                                                                <input
                                                                                    type="number"
                                                                                    value={row.hourlyRate}
                                                                                    onChange={(e) => updateRow(row.id, 'hourlyRate', e.target.value)}
                                                                                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                                                                                    placeholder="0.00"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={addRow}
                                                        className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors mt-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add Row
                                                    </button>
                                                </div>
                                            </Tab.Panel>

                                            {/* Import Panel */}
                                            <Tab.Panel className="outline-none">
                                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/10 group cursor-pointer relative">
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        accept=".csv,.xlsx"
                                                        onChange={handleFileUpload}
                                                    />

                                                    {importStatus === 'idle' && (
                                                        <>
                                                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                                <Upload className="w-8 h-8" />
                                                            </div>
                                                            <h4 className="text-lg font-bold text-slate-800">Drop your CSV file here</h4>
                                                            <p className="text-slate-500 mt-2 max-w-xs text-sm">
                                                                Drag and drop your staff list, or click to browse. We support CSV and Excel files.
                                                            </p>
                                                        </>
                                                    )}

                                                    {importStatus === 'analyzing' && (
                                                        <div className="flex flex-col items-center animate-pulse">
                                                            <FileText className="w-12 h-12 text-slate-400 mb-4" />
                                                            <h4 className="text-lg font-bold text-slate-800">Analyzing File...</h4>
                                                        </div>
                                                    )}

                                                    {importStatus === 'success' && (
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                                                <CheckCircle2 className="w-8 h-8" />
                                                            </div>
                                                            <h4 className="text-lg font-bold text-slate-800">Ready to Import</h4>
                                                            <p className="text-emerald-600 mt-2 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                                                {importedData.length} records found
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>

                                {/* Footer (Sticky) */}
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                        {isSubmitting ? 'Sending...' : 'Send Invites'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
