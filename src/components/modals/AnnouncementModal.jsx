import React, { useState } from 'react';
import { X, Megaphone, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const AnnouncementModal = ({ isOpen, onClose }) => {
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [target, setTarget] = useState('all');

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim()) return;

        setSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitting(false);
        setSuccess(true);
        toast.success("Announcement Sent! 📣");

        setTimeout(() => {
            setSuccess(false);
            setMessage('');
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-blue-600" />
                        New Announcement
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center text-center animate-in fade-in">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Sent Successfully!</h4>
                        <p className="text-slate-500 mt-2">Your message has been broadcast to everyone.</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        {/* Target Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To:</label>
                            <div className="flex gap-2">
                                {['all', 'staff', 'athletes'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTarget(t)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize border transition-all ${target === t
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none min-h-[120px] text-slate-800 resize-none transition-colors"
                                placeholder="Write your announcement here..."
                                autoFocus
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSend}
                                disabled={submitting || !message.trim()}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Broadcast
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementModal;
