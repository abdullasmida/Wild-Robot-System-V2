import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export default function ChatDetail() {
    const navigate = useNavigate();
    const { id } = useParams(); // This could be a Group ID or User ID based on your route
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const messagesEndRef = useRef(null);

    // 1. Identify "Who am I?" & Fetch Messages
    useEffect(() => {
        const initChat = async () => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);

            fetchMessages();
        };

        initChat();

        // 🟢 Real-time Subscription (Magic!)
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                // If the new message belongs to this chat view, add it
                // Note: In a real complex app, filter by chat/group ID. 
                // For now, we show all (Global Chat Logic) or filter if needed.
                const newMsg = payload.new;
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function fetchMessages() {
        try {
            setLoading(true);
            // Fetch messages populated with sender info
            // Note: Supabase JS select with relation requires setup, for speed we fetch plain messages first
            // Or use a join if sender_id foreign key is set up to profiles
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles(full_name, avatar_url)
                `)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !currentUserId) return;

        const textToSend = inputText;
        setInputText(''); // Optimistic clear

        try {
            const { error } = await supabase
                .from('messages')
                .insert([
                    {
                        content: textToSend,
                        sender_id: currentUserId,
                        // receiver_id: id // Uncomment if 1-on-1 chat
                    }
                ]);

            if (error) throw error;
            // No need to setMessages manually if Subscription is on, 
            // but for instant feedback you can do it optimistically.
        } catch (err) {
            console.error('Send failed:', err);
            alert('Failed to send message');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                        T
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">Team Chat</h2>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                        </p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center pt-10">
                        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-slate-400 mt-10">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={clsx("flex w-full", isMe ? "justify-end" : "justify-start")}
                            >
                                <div className={clsx(
                                    "max-w-[75%] rounded-2xl p-4 shadow-sm relative group transition-all",
                                    isMe
                                        ? "bg-emerald-500 text-white rounded-tr-sm"
                                        : "bg-white text-slate-800 rounded-tl-sm border border-slate-100"
                                )}>
                                    {!isMe && (
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">
                                            {msg.sender?.full_name || 'User'}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <span className={clsx(
                                        "text-[9px] block mt-1 text-right opacity-70",
                                        isMe ? "text-emerald-100" : "text-slate-300"
                                    )}>
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </footer>
        </div>
    );
}