import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function Support() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Support Center</h1>
                    <p className="text-slate-500 font-medium">We're here to help. Send us a message.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                                    <option>General Inquiry</option>
                                    <option>Technical Issue</option>
                                    <option>Billing Question</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
                            <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[150px]" placeholder="How can we help you?" required></textarea>
                        </div>

                        <button
                            disabled={sent}
                            className={`w-full py-4 rounded-xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 ${sent ? 'bg-green-500' : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98]'}`}
                        >
                            {sent ? (
                                <>Message Sent!</>
                            ) : (
                                <>
                                    <Send size={18} /> Send Message
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <ContactCard
                        icon={<Mail size={20} />}
                        label="Email Us"
                        value="support@wildrobot.com"
                        color="bg-blue-50 text-blue-600"
                    />
                    <ContactCard
                        icon={<Phone size={20} />}
                        label="Call Us"
                        value="+971 50 123 4567"
                        color="bg-purple-50 text-purple-600"
                    />
                    <ContactCard
                        icon={<MapPin size={20} />}
                        label="Visit Us"
                        value="Dubai Silicon Oasis, HQ"
                        color="bg-orange-50 text-orange-600"
                    />

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-black text-lg mb-2">Need immediate help?</h3>
                            <p className="text-sm text-emerald-100 mb-4">Check our knowledge base for quick answers to common questions.</p>
                            <button className="bg-white text-emerald-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors">
                                View Docs
                            </button>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactCard({ icon, label, value, color }) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-colors">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
