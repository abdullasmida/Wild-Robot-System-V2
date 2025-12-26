import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { supabase } from '../supabaseClient';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your Wild Robot assistant 🤖 Use the buttons below or ask me anything!", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text) => {
        if (!text.trim()) return;

        // Add User Message
        const userMsg = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Process Response
        const responseText = await processMessage(text);

        // Simulate thinking delay
        setTimeout(() => {
            const botMsg = { id: Date.now() + 1, text: responseText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const processMessage = async (input) => {
        const lowerInput = input.toLowerCase();

        // 1. Next Class Logic
        if (lowerInput.includes('next class') || lowerInput.includes('schedule') || lowerInput.includes('session')) {
            const todayStr = format(new Date(), 'yyyy-MM-dd');

            // Mocking the query logic as if we are checking for a global user or just getting upcoming sessions
            // Ideally we would query session_enrollments for the logged-in user
            const { data: sessions, error } = await supabase
                .from('sessions')
                .select('*')
                .gte('date', todayStr)
                .order('date', { ascending: true })
                .order('start_time', { ascending: true })
                .limit(1);

            if (error || !sessions || sessions.length === 0) {
                return "I couldn't find any upcoming classes scheduled for today or later.";
            }

            const next = sessions[0];
            return `Your next class is "${next.title}" on ${format(new Date(next.date), 'EEE, MMM d')} at ${next.start_time}. 📅`;
        }

        // 2. Balance Logic
        if (lowerInput.includes('balance') || lowerInput.includes('subscription') || lowerInput.includes('package')) {
            // Mock Response
            return "You have 4 classes remaining in your 'Gold Package' subscription. 💰";
        }

        // 3. Support Logic
        if (lowerInput.includes('support') || lowerInput.includes('help') || lowerInput.includes('contact')) {
            return "You can contact Head Coach Abdulla at +971-50-123-4567 for immediate assistance. 📞";
        }

        // Default
        return "I'm still learning! Please try clicking one of the quick actions below or ask about your schedule/balance. 🤖";
    };

    const chips = [
        { label: "📅 Next Class", query: "When is my next class?" },
        { label: "💰 My Balance", query: "What is my balance?" },
        { label: "📞 Support", query: "Contact support" },
    ];

    return (
        <>
            {/* Widget Button */}
            {/* Mobile: Bottom Left (Safe from FAB on Right) */}
            {/* Desktop: Bottom Right (Stacked below FAB) */}
            <div className="fixed z-50 bottom-[90px] left-6 md:bottom-6 md:right-6 md:left-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-14 w-14 rounded-full bg-slate-900 md:bg-emerald-600 text-white shadow-xl shadow-slate-400 md:shadow-emerald-200 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
                >
                    <span className="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">smart_toy</span>
                    {/* Notification dot */}
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-bounce-slow"></span>
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed z-50 bottom-24 left-6 md:bottom-24 md:right-6 md:left-auto w-[350px] max-w-[calc(100vw-48px)] h-[500px] flex flex-col overflow-hidden bg-white/90 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white flex justify-between items-center shadow-sm relative overflow-hidden">
                        {/* Abstract Background Shape */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">Wild Robot Assistant</h3>
                                <p className="text-[10px] text-emerald-50 flex items-center gap-1.5 opacity-90">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {messages.map(msg => (
                            <div key={msg.id} className={clsx("flex", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                                <div className={clsx(
                                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm",
                                    msg.sender === 'user'
                                        ? "bg-emerald-600 text-white rounded-br-none"
                                        : "bg-white text-slate-700 border border-gray-100/50 rounded-bl-none"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/80 border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-75"></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 bg-white/60 border-t border-gray-100/50 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                        {chips.map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(chip.query)}
                                className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 rounded-full text-xs font-bold text-slate-600 transition-all border border-gray-200 shadow-sm"
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                        <button
                            onClick={() => handleSend(inputText)}
                            className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-200"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
