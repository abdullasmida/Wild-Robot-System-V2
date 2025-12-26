import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import clsx from 'clsx';

export default function Home() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ classes: 4, students: 32, checkedIn: 12 });
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentDate = new Date(); // Use real date
    const greeting = getGreeting(currentDate);

    // Mock "Live" Class
    const liveClass = {
        name: "Elite Boys (Sharjah)",
        time: "16:00 - 17:30",
        location: "Main Hall",
        attendees: 15,
        total: 18
    };

    // Mock "Up Next" Classes
    const upcomingClasses = [
        { id: 1, name: "Level 2 Girls", time: "17:30 - 18:30", branch: "Sharjah", students: 12 },
        { id: 2, name: "Intro to Gym", time: "18:30 - 19:30", branch: "Sharjah", students: 8 },
    ];

    useEffect(() => {
        // Simulate fetching stats
        setTimeout(() => setLoading(false), 1000);
        fetchAnnouncements();
    }, []);

    async function fetchAnnouncements() {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error || !data || data.length === 0) {
            // Mock Data Fallback
            setAnnouncements([
                {
                    id: 1,
                    type: 'celebration',
                    author_name: 'Patrick Nehemtallah',
                    author_avatar: '',
                    title: 'Employee of the Month',
                    content: 'Job well done! Patricia, you have truly shined this month! From chasing every lead to providing excellent customer support 🤝, you showed consistency.',
                    image_url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1674&q=80',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    type: 'news',
                    author_name: 'Head Office',
                    title: 'New Beam Rotation Schedule',
                    content: 'The updated rotation for Term 1 has been uploaded. Please review before Sunday to ensure all coaches are aligned.',
                    created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
                }
            ]);
        } else {
            setAnnouncements(data);
        }
    }

    function getGreeting(date) {
        const hour = date.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-[100px]">
            {/* 1. Hero / Header */}
            <header className="bg-white px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-md bg-white/90">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(currentDate, 'EEEE, d MMM yyyy')}</p>
                    <h1 className="text-2xl font-black text-slate-900 mt-1">{greeting},<br /><span className="text-emerald-500">Coach Abdulla 👋</span></h1>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className="h-12 w-12 rounded-full border-2 border-gray-100 p-0.5 hover:border-emerald-500 transition-colors"
                >
                    <div className="h-full w-full rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {/* Placeholder Avatar */}
                        <div className="bg-emerald-100 text-emerald-600 font-bold h-full w-full flex items-center justify-center">CA</div>
                    </div>
                </button>
            </header>

            <main className="p-4 space-y-8">
                {/* 2. Live Now Card */}
                {/* Check if it's within "Live" hours or just show mock for demo */}
                <section>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] to-[#047857] shadow-xl shadow-emerald-900/20 text-white p-6">
                        {/* Background Decor */}
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold tracking-wider uppercase">Live Now</span>
                                </div>
                                <span className="text-emerald-200 text-sm font-medium bg-emerald-900/30 px-2 py-0.5 rounded-md">
                                    {liveClass.time}
                                </span>
                            </div>

                            <h2 className="text-2xl font-black tracking-tight mb-1">{liveClass.name}</h2>
                            <p className="text-emerald-100 text-sm font-medium flex items-center gap-1 mb-6">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                {liveClass.location}
                            </p>

                            <button
                                onClick={() => navigate('/schedule')} // Or specific class view
                                className="w-full bg-white text-emerald-900 font-bold py-3.5 rounded-xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                            >
                                Enter Class & Attendance
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. Today's Overview */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Today's Overview</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <OverviewCard
                            icon="calendar_today"
                            value={stats.classes}
                            label="Classes"
                            color="text-blue-500"
                        />
                        <OverviewCard
                            icon="groups"
                            value={stats.students}
                            label="Expected"
                            color="text-amber-500"
                        />
                        <OverviewCard
                            icon="check_circle"
                            value={stats.checkedIn}
                            label="Checked In"
                            color="text-emerald-500"
                        />
                    </div>
                </section>

                {/* 4. Up Next Timeline */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Up Next</h3>
                    <div className="space-y-0">
                        {upcomingClasses.map((item, index) => (
                            <div key={item.id} className="flex gap-4 relative">
                                {/* Timeline Line */}
                                <div className="flex flex-col items-center">
                                    <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-50 z-10"></div>
                                    {index !== upcomingClasses.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
                                    )}
                                </div>
                                {/* Content */}
                                <div className="pb-6 flex-1">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-300 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                                            <span className="text-xs font-bold text-slate-400 bg-gray-50 px-2 py-0.5 rounded-md">{item.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">apartment</span>
                                                {item.branch}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">group</span>
                                                {item.students} Students
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Community Feed (Connecteam Style) */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-lg font-bold text-slate-900">Latest Updates</h3>
                        <button className="text-emerald-600 text-xs font-bold">View All</button>
                    </div>

                    <div className="space-y-4">
                        {announcements.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No updates yet. Check back later!
                            </div>
                        ) : (
                            announcements.map(item => (
                                <FeedCard key={item.id} item={item} />
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

function OverviewCard({ icon, value, label, color }) {
    return (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-5">
            <span className={clsx("material-symbols-outlined text-[20px] mb-2", color)}>{icon}</span>
            <span className="text-xl font-black text-slate-900 leading-none mb-1">{value}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        </div>
    );
}

function FeedCard({ item }) {
    const isCelebration = item.type === 'celebration';
    const dateStr = format(new Date(item.created_at), 'MMM d, h:mm a');

    return (
        <div className={clsx(
            "rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md",
            isCelebration ? "bg-purple-50 border-purple-100" : "bg-white border-gray-100"
        )}>
            {/* Header */}
            <div className="p-4 pb-2 flex items-center gap-3">
                <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm", isCelebration ? "bg-purple-200 text-purple-700" : "bg-gray-100 text-slate-500")}>
                    {item.author_name ? item.author_name.charAt(0) : 'A'}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.author_name} • {dateStr}</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap leading-relaxed">{item.content}</p>

                {/* Image Attachment */}
                {item.image_url && (
                    <div className="rounded-xl overflow-hidden mt-2 border border-gray-100/50">
                        <img src={item.image_url} alt="Post attachment" className="w-full h-48 object-cover" />
                    </div>
                )}
            </div>

            {/* Celebration Footer Overlay (Optional visual touch) */}
            {isCelebration && (
                <div className="h-1 w-full bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 opacity-50"></div>
            )}
        </div>
    );
}
