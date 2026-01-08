import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Bell, Check, Trash2, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../supabaseClient';
import { toast } from 'sonner';

interface Notification {
    id: string;
    created_at: string;
    type: 'conflict' | 'system' | 'info';
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
}

interface NotificationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch initial notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50); // Limit to last 50 for now

            if (error) {
                // If table doesn't exist (404/400), don't crash, just show empty
                console.warn("Notifications fetch failed (Table might be missing):", error);
                setNotifications([]);
            } else {
                setNotifications(data as Notification[]);
            }
            setLoading(false);
        };

        if (isOpen) fetchNotifications();
    }, [isOpen]);

    // Realtime Subscription
    useEffect(() => {
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const subscription = supabase
                .channel('notifications-drawer')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newNotif = payload.new as Notification;
                        setNotifications(prev => [newNotif, ...prev]);
                        toast("New Notification", { description: newNotif.title });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        };
        setupSubscription();
    }, []);

    // Actions
    const markAsRead = async (id: string) => {
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'conflict': return <AlertTriangle className="text-amber-500" size={20} />;
            case 'system': return <Info className="text-blue-500" size={20} />;
            default: return <MessageSquare className="text-slate-400" size={20} />;
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">

                            {/* Panel */}
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col bg-white shadow-2xl">

                                        {/* Header */}
                                        <div className="bg-slate-50 px-4 py-6 sm:px-6 border-b border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <Dialog.Title className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                    <Bell className="text-emerald-600" size={20} />
                                                    Notifications
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                        onClick={onClose}
                                                    >
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* List */}
                                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
                                            {loading ? (
                                                <div className="flex justify-center py-10">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <Bell className="mx-auto h-12 w-12 text-slate-200" />
                                                    <h3 className="mt-2 text-sm font-semibold text-slate-900">All caught up!</h3>
                                                    <p className="mt-1 text-sm text-slate-500">No new notifications.</p>
                                                </div>
                                            ) : (
                                                <ul className="space-y-4">
                                                    {notifications.map((notif) => (
                                                        <li
                                                            key={notif.id}
                                                            onClick={() => markAsRead(notif.id)}
                                                            className={`relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${notif.is_read
                                                                ? 'bg-white border-slate-100 opacity-70 hover:opacity-100'
                                                                : 'bg-blue-50/50 border-blue-100 shadow-sm ring-1 ring-blue-500/10'
                                                                }`}
                                                        >
                                                            <div className="flex-shrink-0 mt-1">
                                                                {getIcon(notif.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <p className={`text-sm font-medium ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                                        {notif.title}
                                                                    </p>
                                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 leading-relaxed max-w-[90%]">
                                                                    {notif.message}
                                                                </p>
                                                            </div>

                                                            {/* Actions Hover */}
                                                            <button
                                                                onClick={(e) => deleteNotification(notif.id, e)}
                                                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
