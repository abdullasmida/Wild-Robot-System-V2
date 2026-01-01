import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Shield, Link as LinkIcon, Copy, CheckCircle, Loader2 } from 'lucide-react';

const InviteStaffModal = ({ isOpen, onClose, academyId, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('coach'); // Default role
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Generate a secure random token
            const token = crypto.randomUUID();

            // 2. Insert into Database
            const { error } = await supabase
                .from('invitations')
                .insert([
                    {
                        academy_id: academyId,
                        email: email,
                        role: role,
                        token: token,
                        status: 'pending'
                    }
                ]);

            if (error) throw error;

            // 3. Create the Magic Link
            const link = `${window.location.origin}/join?token=${token}`;
            setGeneratedLink(link);
            if (onSuccess) onSuccess();

        } catch (err) {
            alert('Error creating invitation: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetAndClose = () => {
        setGeneratedLink(null);
        setEmail('');
        setRole('coach');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Invite New Staff</h3>
                    <button onClick={resetAndClose} className="p-1 hover:bg-slate-200 rounded-full transition">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!generatedLink ? (
                        // STATE 1: INPUT FORM
                        <form onSubmit={handleInvite} className="space-y-4">

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                        placeholder="coach@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role & Permissions</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('coach')}
                                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${role === 'coach' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300'}`}
                                    >
                                        <span className="font-bold text-sm text-slate-800">Coach</span>
                                        <span className="text-xs text-slate-500">Manage athletes & attendance.</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRole('head_coach')}
                                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${role === 'head_coach' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300'}`}
                                    >
                                        <span className="font-bold text-sm text-slate-800">Head Coach</span>
                                        <span className="text-xs text-slate-500">Full technical oversight.</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><LinkIcon className="w-5 h-5" /> Generate Invite Link</>}
                            </button>
                        </form>
                    ) : (
                        // STATE 2: SUCCESS & LINK COPY
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-8 h-8" />
                            </div>

                            <div>
                                <h4 className="text-lg font-bold text-slate-900">Invitation Created!</h4>
                                <p className="text-sm text-slate-500">Share this link with the coach to let them join.</p>
                            </div>

                            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 break-all text-sm text-slate-600 font-mono select-all">
                                {generatedLink}
                            </div>

                            <button
                                onClick={copyToClipboard}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copied ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                            >
                                {copied ? <>Copied! <CheckCircle className="w-5 h-5" /></> : <>Copy Link <Copy className="w-5 h-5" /></>}
                            </button>

                            <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600 text-sm font-medium">
                                Close & Invite Another
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteStaffModal;