import React, { useState } from 'react';
import { clsx } from 'clsx';
// import confetti from 'canvas-confetti'; // Assuming it's installed, otherwise we skip or use mock

export default function Achievements() {
    const [activeTab, setActiveTab] = useState('medals'); // 'medals' | 'badges'
    const [selectedBadge, setSelectedBadge] = useState(null);

    // Mock Data
    const medals = [
        { id: 1, title: 'Gold - Winter Cup', date: 'Dec 2024', type: 'gold', category: 'academy' },
        { id: 2, title: 'Silver - Regional Open', date: 'Nov 2024', type: 'silver', category: 'external' },
        { id: 3, title: 'Bronze - Spring Roll', date: 'Oct 2024', type: 'bronze', category: 'academy' },
    ];

    const badges = [
        { id: 1, title: 'Monkey King', icon: '🐵', description: 'Mastered the monkey bar walk across the entire gym!', unlocked: true },
        { id: 2, title: 'Early Bird', icon: '🌅', description: 'Attended 5 morning classes in a row.', unlocked: true },
        { id: 3, title: 'Iron Grip', icon: '✊', description: 'Held a pull-up hang for 60 seconds.', unlocked: false },
        { id: 4, title: 'Speedster', icon: '⚡', description: 'Completed the obstacle course in under 30s.', unlocked: false },
        { id: 5, title: 'Team Player', icon: '🤝', description: 'Helped a teammate during a drill.', unlocked: true },
    ];

    const handleBadgeClick = (badge) => {
        if (!badge.unlocked) return;

        setSelectedBadge(badge);

        // Trigger Confetti if available
        if (typeof window.confetti === 'function') {
            window.confetti({ zIndex: 9999, particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
            // Fallback or if confetti is imported as module
            try {
                import('canvas-confetti').then((confetti) => {
                    confetti.default({ zIndex: 9999, particleCount: 100, spread: 70, origin: { y: 0.6 } });
                });
            } catch (e) {
                console.log("Confetti not available");
            }
        }
    };

    return (
        <div className="space-y-6">

            {/* Header / Medal Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-50">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Total Loot</h2>
                <div className="flex justify-center gap-8">
                    <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mb-1 shadow-sm">
                            <span className="material-symbols-outlined text-[28px]">military_tech</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800">2</span>
                        <span className="text-[10px] text-slate-400 font-bold">GOLD</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-1 shadow-sm">
                            <span className="material-symbols-outlined text-[28px]">military_tech</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800">4</span>
                        <span className="text-[10px] text-slate-400 font-bold">SILVER</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center mb-1 shadow-sm">
                            <span className="material-symbols-outlined text-[28px]">military_tech</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800">1</span>
                        <span className="text-[10px] text-slate-400 font-bold">BRONZE</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-blue-50">
                <button
                    onClick={() => setActiveTab('medals')}
                    className={clsx(
                        "flex-1 py-3 text-sm font-black rounded-lg transition-all",
                        activeTab === 'medals' ? "bg-amber-100 text-amber-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    MEDALS 🏅
                </button>
                <button
                    onClick={() => setActiveTab('badges')}
                    className={clsx(
                        "flex-1 py-3 text-sm font-black rounded-lg transition-all",
                        activeTab === 'badges' ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    BADGES 🛡️
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'medals' ? (
                <div className="space-y-3 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Toggle inside medals if needed, or just list all for now */}
                    {medals.map(medal => (
                        <div key={medal.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-50">
                            <div className={clsx(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                medal.type === 'gold' ? "bg-amber-100 text-amber-600" :
                                    medal.type === 'silver' ? "bg-slate-100 text-slate-500" :
                                        "bg-orange-100 text-orange-700"
                            )}>
                                <span className="material-symbols-outlined text-[32px]">emoji_events</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{medal.title}</h3>
                                <p className="text-xs text-slate-500 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-1 uppercase">
                                    {medal.category}
                                </p>
                            </div>
                            <span className="ml-auto text-xs font-bold text-slate-400">{medal.date}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-bottom-5 duration-300">
                    {badges.map(badge => (
                        <button
                            key={badge.id}
                            onClick={() => handleBadgeClick(badge)}
                            className={clsx(
                                "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all active:scale-95",
                                badge.unlocked
                                    ? "bg-white shadow-sm border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-md cursor-pointer"
                                    : "bg-slate-100 border-2 border-transparent grayscale opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span className="text-4xl mb-2 filter drop-shadow-sm">{badge.icon}</span>
                            <span className="text-[10px] font-bold text-slate-600 text-center leading-tight line-clamp-2">{badge.title}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Badge Details Modal */}
            {selectedBadge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedBadge(null)}>
                    <div
                        className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Confetti Burst Background Effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>

                        <div className="h-24 w-24 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
                            <span className="text-6xl animate-bounce-slow">{selectedBadge.icon}</span>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-2 relative z-10">{selectedBadge.title}</h2>
                        <p className="text-slate-500 font-medium mb-8 relative z-10">{selectedBadge.description}</p>

                        <button
                            onClick={() => setSelectedBadge(null)}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all relative z-10"
                        >
                            Awesome! 🚀
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
