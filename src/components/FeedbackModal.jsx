import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { clsx } from 'clsx';

export default function FeedbackModal({ isOpen, onClose }) {
    const [type, setType] = useState('bug'); // 'bug', 'feature', 'other'
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert([
                    { type, title, description, created_at: new Date() }
                ]);

            if (error) {
                console.error('Error submitting feedback:', error);
                // Optionally handle error state
            } else {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    onClose();
                    // Reset form
                    setTitle('');
                    setDescription('');
                    setType('bug');
                }, 2000);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

                {submitted ? (
                    <div className="p-12 text-center">
                        <div className="h-16 w-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[32px]">check</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Thanks for your feedback!</h3>
                        <p className="text-slate-500">We appreciate your help in making Wild Robot better. 🚀</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Help us improve Wild Robot 🚀</h2>
                                <p className="text-xs text-slate-500">Report a bug or suggest a new feature.</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Type Selector */}
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                                {[
                                    { id: 'bug', label: '🐞 Bug Report' },
                                    { id: 'feature', label: '✨ Feature' },
                                    { id: 'other', label: '💭 Other' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setType(opt.id)}
                                        className={clsx(
                                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                            type === opt.id
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Summary</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Calendar not loading on mobile..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Details</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Tell us more about what happened or your idea..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Feedback"
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
