import { useState } from 'react';
import { X, Check, Loader2, ChevronDown, Plus, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface UniversalAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    type?: 'staff' | 'athlete'; // Made optional to prevent breaking existing usages, defaults to 'staff'
    initialTab?: number; // Kept for compatibility but ignored in new UI
}

export default function UniversalAddModal({ isOpen, onClose, type = 'staff' }: UniversalAddModalProps) {
    // --- States ---
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // For the Success View

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        salary: '',
    });

    // Smart Role Selector States
    const [selectedRole, setSelectedRole] = useState('Coach');
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isAddingCustomRole, setIsAddingCustomRole] = useState(false);
    const [customRoleInput, setCustomRoleInput] = useState('');

    const predefinedRoles = ['Coach', 'Admin', 'Manager', 'Assistant'];

    if (!isOpen) return null;

    // --- Handlers ---

    const handleInvite = async () => {
        // 1. Validation
        if (!formData.email || !formData.firstName || !formData.lastName) {
            toast.error('Missing Fields', {
                description: 'Please provide First Name, Last Name, and Email.',
            });
            return;
        }

        // 2. Prepare Payload
        setIsLoading(true);
        const payload = {
            ...formData,
            role: selectedRole, // This carries either "Coach" or the custom role
            color: '#10B981', // Default logic or random color
        };

        try {
            // 3. API Call
            const res = await fetch('/api/invite/route', { // Updated path to match file location
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send invite');
            }

            // 4. Success State
            setIsSuccess(true);
            toast.success('Invite Sent! 🚀', {
                description: `${formData.firstName} has been invited as a ${selectedRole}.`,
            });

        } catch (error: any) {
            console.error(error);
            toast.error('Invite Failed', {
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomRoleSave = () => {
        if (customRoleInput.trim()) {
            setSelectedRole(customRoleInput);
            setIsAddingCustomRole(false);
            setIsRoleDropdownOpen(false);
        }
    };

    // --- Render ---

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">
                        {isSuccess ? 'Mission Accomplished' : `Add New ${type === 'staff' ? 'Staff Member' : 'Athlete'}`}
                    </h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6">

                    {/* SUCCESS VIEW */}
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in">
                            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
                                <Check size={40} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Invite Sent Successfully!</h3>
                            <p className="text-slate-500 max-w-xs">
                                We've sent an email to <span className="text-emerald-600 font-bold">{formData.email}</span>.
                                They can now set their password and join your academy.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Done
                            </button>
                            <button
                                onClick={() => {
                                    setIsSuccess(false);
                                    setFormData({ firstName: '', lastName: '', email: '', salary: '' });
                                }}
                                className="mt-4 text-sm font-bold text-slate-400 hover:text-emerald-500"
                            >
                                + Add Another
                            </button>
                        </div>
                    ) : (

                        /* FORM VIEW */
                        <div className="space-y-4">

                            {/* Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                                        placeholder="e.g. Sarah"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                                        placeholder="e.g. Connor"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                                        placeholder="coach@example.com"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Smart Role Selector */}
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>

                                {/* Selector Trigger */}
                                <div
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors group"
                                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                >
                                    <span className="capitalize font-medium">{selectedRole}</span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform group-hover:text-emerald-500 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Dropdown Menu */}
                                {isRoleDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                                        {!isAddingCustomRole ? (
                                            <>
                                                {predefinedRoles.map((role) => (
                                                    <div
                                                        key={role}
                                                        onClick={() => { setSelectedRole(role); setIsRoleDropdownOpen(false); }}
                                                        className="px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 cursor-pointer font-medium"
                                                    >
                                                        {role}
                                                    </div>
                                                ))}
                                                <div className="h-[1px] bg-slate-100 my-1"></div>
                                                <div
                                                    onClick={() => setIsAddingCustomRole(true)}
                                                    className="px-3 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer flex items-center gap-2 font-bold"
                                                >
                                                    <Plus size={14} /> Add New Role
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-2 flex gap-2">
                                                <input
                                                    autoFocus
                                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                                                    placeholder="Type role..."
                                                    value={customRoleInput}
                                                    onChange={(e) => setCustomRoleInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleCustomRoleSave()}
                                                />
                                                <button onClick={handleCustomRoleSave} className="p-1.5 bg-emerald-500 rounded-lg hover:bg-emerald-600 text-white shadow-sm"><Check size={14} /></button>
                                                <button onClick={() => setIsAddingCustomRole(false)} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-500"><X size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Salary (Optional) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Salary (AED)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">AED</span>
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="0.00"
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleInvite}
                                    disabled={isLoading}
                                    className="flex-[2] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Sending...
                                        </>
                                    ) : (
                                        <>Send Official Invite 📨</>
                                    )}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
