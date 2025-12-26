import React, { useState } from 'react';
import clsx from 'clsx';

// Mock Data
const MOCK_CHATS = [
    { id: 1, name: 'Coach Sarah', message: 'See you at practice!', time: '10:30 AM', unread: 2, status: 'online', avatar: 'S' },
    { id: 2, name: 'Admin Office', message: 'Invoice #1024 is ready.', time: 'Yesterday', unread: 0, status: 'offline', avatar: 'A' },
    { id: 3, name: 'Ajman Team', message: 'Great job everyone!', time: 'Tue', unread: 0, status: 'online', avatar: 'T' },
];

export default function Chat() {
    const [selectedChat, setSelectedChat] = useState(MOCK_CHATS[0]);
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'thread'

    return (
        <div className="h-screen bg-white flex overflow-hidden">
            {/* Sidebar (List) */}
            <div className={clsx(
                "w-full md:w-4/12 lg:w-3/12 flex flex-col border-r border-gray-100 bg-white z-10 transition-transform",
                mobileView === 'thread' ? "hidden md:flex" : "flex"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-20">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h1>
                        <button className="flex items-center gap-1 text-emerald-600 text-xs font-bold hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[16px]">campaign</span>
                            Broadcast
                        </button>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {MOCK_CHATS.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => {
                                setSelectedChat(chat);
                                setMobileView('thread');
                            }}
                            className={clsx(
                                "w-full flex items-center gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left relative",
                                selectedChat?.id === chat.id && "bg-emerald-50/50 border-r-4 border-r-emerald-500"
                            )}
                        >
                            <div className="relative">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {chat.avatar}
                                </div>
                                {chat.status === 'online' && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={clsx("text-sm truncate", chat.unread ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                                        {chat.name}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-medium">{chat.time}</span>
                                </div>
                                <p className={clsx("text-xs truncate", chat.unread ? "font-bold text-slate-800" : "text-slate-500")}>
                                    {chat.message}
                                </p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {chat.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Thread Area */}
            <div className={clsx(
                "flex-1 flex flex-col bg-gray-50",
                mobileView === 'list' ? "hidden md:flex" : "flex fixed inset-0 z-30 md:static"
            )}>
                {selectedChat ? (
                    <>
                        {/* Thread Header */}
                        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-1 -ml-2 text-slate-500"
                                    onClick={() => setMobileView('list')}
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                                    {selectedChat.avatar}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 text-sm">{selectedChat.name}</h2>
                                    <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="h-9 w-9 bg-gray-50 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                </button>
                                <button className="h-9 w-9 bg-gray-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-gray-100 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="text-center text-xs text-slate-300 font-bold uppercase tracking-wider my-4">Today</div>

                            {/* Their Message */}
                            <div className="flex items-end gap-2">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[75%] text-slate-700 text-sm leading-relaxed border border-gray-100">
                                    <p>Hello! Just checking in on the schedule.</p>
                                    <span className="text-[10px] text-slate-300 mt-1 block">10:00 AM</span>
                                </div>
                            </div>

                            {/* My Message */}
                            <div className="flex items-end gap-2 justify-end">
                                <div className="bg-emerald-500 p-3 rounded-2xl rounded-tr-none shadow-md shadow-emerald-200 max-w-[75%] text-white text-sm leading-relaxed">
                                    <p>Hi! Yes, everything is updated in the Master Schedule.</p>
                                    <span className="text-[10px] text-emerald-200 mt-1 block text-right">10:05 AM</span>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                                    <span className="material-symbols-outlined">add_circle</span>
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-50 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 border-transparent"
                                />
                                <button className="h-11 w-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 transition-all active:scale-95">
                                    <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8">
                        <span className="material-symbols-outlined text-6xl mb-4">chat_bubble_outline</span>
                        <p className="font-bold text-lg">Select a conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
