import React, { useState } from 'react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function OperationsFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const navigate = useNavigate();

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <>
            <div className="fixed bottom-[90px] right-6 z-50 flex flex-col items-end gap-3">
                {/* Speed Dial Menu */}
                <div className={clsx("flex flex-col items-end gap-3 transition-all duration-300 origin-bottom-right", isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-10 pointer-events-none")}>

                    <FabAction
                        icon="edit_note"
                        label="Post Update"
                        color="bg-purple-600"
                        onClick={() => { toggleOpen(); setShowPostModal(true); }}
                    />
                    <FabAction
                        icon="person_add"
                        label="Add Athlete"
                        color="bg-emerald-500"
                        onClick={() => { toggleOpen(); navigate('/roster'); }}
                    />
                    <FabAction
                        icon="calendar_add_on"
                        label="Create Session"
                        color="bg-blue-500"
                        onClick={() => { toggleOpen(); navigate('/schedule'); }}
                    />
                    <FabAction
                        icon="payments"
                        label="Record Payment"
                        color="bg-amber-500"
                        onClick={() => { toggleOpen(); navigate('/payment'); }}
                    />

                </div>

                {/* Main FAB */}
                <button
                    onClick={toggleOpen}
                    className={clsx(
                        "h-14 w-14 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center",
                        isOpen ? "bg-slate-800 rotate-45" : "bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600"
                    )}
                >
                    <span className="material-symbols-outlined text-[32px] transition-transform duration-300">
                        add
                    </span>
                </button>
            </div>

            {/* Post Update Modal */}
            {showPostModal && <PostUpdateModal onClose={() => setShowPostModal(false)} />}
        </>
    );
}

function FabAction({ icon, label, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 group"
        >
            <span className="bg-white text-slate-600 px-3 py-1 rounded-lg text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {label}
            </span>
            <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-gray-300 transition-transform group-hover:scale-110", color)}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
        </button>
    );
}

function PostUpdateModal({ onClose }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('news'); // news | celebration
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('announcements').insert([
            {
                title,
                content,
                type,
                author_name: 'Coach Abdulla', // Mock User
                created_at: new Date().toISOString()
            }
        ]);

        if (error) {
            alert('Error posting update: ' + error.message);
        } else {
            // alert('Update posted successfully!');
            window.location.reload(); // Simple reload to refresh feed for now
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-slate-900">Post New Update</h3>
                    <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Type Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('news')}
                            className={clsx("flex-1 py-2 rounded-lg text-sm font-bold transition-all", type === 'news' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            📰 News
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('celebration')}
                            className={clsx("flex-1 py-2 rounded-lg text-sm font-bold transition-all", type === 'celebration' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            🎉 Celebration
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Schedule Change"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Content</label>
                        <textarea
                            required
                            rows="4"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening?"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Update'}
                        {!loading && <span className="material-symbols-outlined text-[18px]">send</span>}
                    </button>
                </form>
            </div>
        </div>
    );
}
