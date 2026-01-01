import React, { useState } from 'react';
import {
    User, Mail, Briefcase, Plus, Check,
    Smartphone, Shirt, Calendar, Hash, Sparkles
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';

const REQUIRED_FIELDS = [
    { id: 'name', label: 'Full Name', icon: User, type: 'text' },
    { id: 'email', label: 'Email Address', icon: Mail, type: 'email' },
    { id: 'role', label: 'Role', icon: Briefcase, type: 'select', options: ['coach', 'head_coach', 'manager', 'sales', 'general_staff'] }
];

const OPTIONAL_FIELDS = [
    { id: 'national_id', key: 'national_id', label: 'National ID', icon: Hash, type: 'text', placeholder: 'Ex: 784-1234-1234567-1' },
    { id: 'shirt_size', key: 'shirt_size', label: 'T-Shirt Size', icon: Shirt, type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'emergency_contact', key: 'emergency_contact', label: 'Emergency Phone', icon: Smartphone, type: 'tel', placeholder: '+971 50 123 4567' },
    { id: 'joining_date', key: 'joining_date', label: 'Joining Date', icon: Calendar, type: 'date' },
    { id: 'dob', key: 'dob', label: 'Date of Birth', icon: Calendar, type: 'date' }
];

const StaffInviteForm = ({ onSuccess, onCancel }) => {
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'coach',
        custom_fields: {}
    });
    const [submitting, setSubmitting] = useState(false);

    // Toggle chip selection
    const toggleExtra = (fieldId) => {
        setSelectedExtras(prev => {
            const isRemoving = prev.includes(fieldId);
            if (isRemoving) {
                const newExtras = prev.filter(id => id !== fieldId);
                const newCustom = { ...formData.custom_fields };
                delete newCustom[OPTIONAL_FIELDS.find(f => f.id === fieldId).key];
                setFormData(d => ({ ...d, custom_fields: newCustom }));
                return newExtras;
            } else {
                // Initialize default values when added
                const field = OPTIONAL_FIELDS.find(f => f.id === fieldId);
                let defaultValue = '';
                if (field.id === 'joining_date') defaultValue = new Date().toISOString().split('T')[0];
                if (field.id === 'dob') defaultValue = '2000-01-01';

                setFormData(d => ({
                    ...d,
                    custom_fields: {
                        ...d.custom_fields,
                        [field.key]: defaultValue
                    }
                }));

                return [...prev, fieldId];
            }
        });
    };

    // Handle input changes
    const handleChange = (id, value, isCustom = false) => {
        // Input Masking for Phones
        if (id === 'emergency_contact' || id.includes('phone')) {
            value = value.replace(/[^0-9+ ]/g, '');
        }

        if (isCustom) {
            setFormData(prev => ({
                ...prev,
                custom_fields: {
                    ...prev.custom_fields,
                    [id]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const toastId = toast.loading("Inviting Commander...");

        try {
            // NOTE: Simulated Logic (Since we can't really email without Edge Function)
            // In real life: await supabase.functions.invoke('invite-user', { body: formData })

            await new Promise(r => setTimeout(r, 1500));

            // Simulate randomness
            if (Math.random() > 0.9) throw new Error("Network glitch. Please retry.");

            toast.success("Commander added to your ranks!", { id: toastId });

            // Log for debugging
            console.log("✅ Invite Payload:", formData);

            if (onSuccess) onSuccess();

        } catch (err) {
            console.error("Invite failed:", err);
            toast.error(err.message, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full">

            {/* Left Side: Field Picker */}
            <div className="bg-slate-50 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col overflow-y-auto">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Required Details
                </h4>
                <div className="space-y-2 mb-8 text-sm text-slate-500">
                    <p>Standard profile information is required for all staff members.</p>
                </div>

                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    Add More Fields
                </h4>
                <div className="flex flex-wrap gap-2">
                    {OPTIONAL_FIELDS.map(field => {
                        const isSelected = selectedExtras.includes(field.id);
                        return (
                            <button
                                key={field.id}
                                type="button"
                                onClick={() => toggleExtra(field.id)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isSelected
                                        ? 'bg-emerald-100 border-emerald-200 text-emerald-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
                                    }`}
                            >
                                <field.icon className="w-3 h-3" />
                                {field.label}
                                {isSelected && <Check className="w-3 h-3 ml-1" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Side: The Form */}
            <div className="flex-1 p-6 bg-white overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto md:mx-0">

                    {/* Standard Fields */}
                    <div className="space-y-4">
                        {REQUIRED_FIELDS.map(field => (
                            <div key={field.id}>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <field.icon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    {field.type === 'select' ? (
                                        <select
                                            value={formData[field.id]}
                                            onChange={e => handleChange(field.id, e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none font-medium transition-colors appearance-none"
                                        >
                                            {field.options.map(opt => (
                                                <option key={opt} value={opt}>{opt.replace('_', ' ').toUpperCase()}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={formData[field.id]}
                                            onChange={e => handleChange(field.id, e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none font-medium transition-colors"
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Fields Section */}
                    {selectedExtras.length > 0 && (
                        <div className="pt-6 border-t border-slate-100 animate-fade-in-up">
                            <h5 className="font-bold text-slate-800 mb-4 text-sm">Additional Information</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedExtras.map(id => {
                                    const field = OPTIONAL_FIELDS.find(f => f.id === id);
                                    return (
                                        <div key={id} className="animate-fade-in-up">
                                            <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                                {field.label}
                                            </label>
                                            <div className="relative">
                                                <field.icon className="absolute left-3 top-3.5 w-4 h-4 text-emerald-400/70" />
                                                {field.type === 'select' ? (
                                                    <select
                                                        value={formData.custom_fields[field.key] || ''}
                                                        onChange={e => handleChange(field.key, e.target.value, true)}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg focus:border-emerald-500 outline-none text-sm font-medium"
                                                    >
                                                        <option value="">Select...</option>
                                                        {field.options.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        value={formData.custom_fields[field.key] || ''}
                                                        onChange={e => handleChange(field.key, e.target.value, true)}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg focus:border-emerald-500 outline-none text-sm font-medium placeholder-emerald-800/20"
                                                        placeholder={field.placeholder || '...'}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Authenticating...' : 'Send Invitation'}
                            <Mail className="w-4 h-4" />
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default StaffInviteForm;
