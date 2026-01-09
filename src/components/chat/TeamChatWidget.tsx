import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender?: {
        first_name: string;
        last_name: string;
        avatar_url?: string;
    };
}

const TeamChatWidget = () => {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (!user?.academy_id) return;

        // 1. Fetch Initial Messages
        const fetchMessages = async () => {
            setLoading(true);
            // @ts-ignore
            const { data, error } = await supabase
                .from('academy_messages')
                .select('*, sender:sender_id(first_name, last_name, avatar_url)')
                .eq('academy_id', user.academy_id as string)
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) {
                console.error('Error fetching messages:', error);
                toast.error('Failed to load chat history.');
            } else {
                setMessages(data || []);
            }
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        };

        fetchMessages();

        // 2. Subscribe to Realtime Changes
        const channel = supabase
            .channel(`academy-chat-${user.academy_id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'academy_messages',
                    filter: `academy_id=eq.${user.academy_id}`
                },
                async (payload) => {
                    const newMsg = payload.new as Message;

                    // Fetch sender details separately since realtime payload doesn't include joins
                    const { data: senderData } = await supabase
                        .from('profiles')
                        .select('first_name, last_name, avatar_url')
                        .eq('id', newMsg.sender_id)
                        .single();

                    const msgWithSender = {
                        ...newMsg,
                        sender: senderData || { first_name: 'Unknown', last_name: 'User' }
                    };

                    setMessages((prev) => [...prev, msgWithSender]);
                }
            )
            .subscribe();

        subscriptionRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.academy_id]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user?.academy_id) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear
        setSending(true);

        // @ts-ignore
        const { error } = await supabase
            .from('academy_messages')
            .insert({
                academy_id: user.academy_id,
                sender_id: user.id,
                content: content,
                channel_id: 'general'
            });

        if (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message.');
            setNewMessage(content); // Restore message on failure
        }

        setSending(false);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-red-500 text-white rotate-90' : 'bg-blue-600 text-white'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 z-40 w-96 max-h-[600px] h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="bg-blue-600 p-4 shrink-0 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white text-lg">Team Chat</h3>
                        <p className="text-blue-100 text-xs">Realtime collaboration</p>
                    </div>
                    <div className="flex -space-x-2">
                        {/* Placeholder avatars could go here */}
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-slate-400 mt-10">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No messages yet.<br />Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === user?.id;
                            const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] ${isMe ? 'order-1' : 'order-2'}`}>
                                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {!isMe && <span className="font-bold text-slate-500">{msg.sender?.first_name}</span>}
                                            <span>{time}</span>
                                        </div>
                                    </div>

                                    {/* Avatar (if remote) */}
                                    {!isMe && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-500 mr-2 order-1 overflow-hidden shrink-0">
                                            {msg.sender?.avatar_url ? (
                                                <img src={msg.sender.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                msg.sender?.first_name?.[0] || <User className="w-4 h-4" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 outline-none text-slate-800 placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default TeamChatWidget;
