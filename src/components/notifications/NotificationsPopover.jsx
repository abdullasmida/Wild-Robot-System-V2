import React from 'react';
import { Bell, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: "New Conflict Detected",
        message: "Coach Sarah has overlapping sessions in Main Hall.",
        type: "alert",
        time: "2m ago"
    },
    {
        id: 2,
        title: "System Update",
        message: "Wibo v2.0 is now live! Check out the new features.",
        type: "info",
        time: "1h ago"
    },
    {
        id: 3,
        title: "Welcome Wibo",
        message: "Your new AI assistant is ready to help.",
        type: "success",
        time: "3h ago"
    }
];

export default function NotificationsPopover({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-10" onClick={onClose} />
            <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700">Mark all read</button>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'alert' ? 'bg-red-100 text-red-500' :
                                        notif.type === 'info' ? 'bg-blue-100 text-blue-500' :
                                            'bg-emerald-100 text-emerald-500'
                                    }`}>
                                    {notif.type === 'alert' ? <AlertCircle className="w-4 h-4" /> :
                                        notif.type === 'info' ? <Info className="w-4 h-4" /> :
                                            <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{notif.title}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{notif.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                    <button className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                        View Archive
                    </button>
                </div>
            </div>
        </>
    );
}
