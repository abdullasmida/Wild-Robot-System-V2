import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalIcon, Coffee, Plus } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { supabaseService } from '../../services/supabaseService';

const Schedule = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);

    // 1. Dynamic Color Generator (Hash string to color)
    const getColorForBranch = (str) => {
        if (!str) return 'bg-slate-500';
        const colors = [
            'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
            'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
            'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
            'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    // 2. Fetch Real Data
    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            // Fetch from Supabase Service (which needs to be V3 compliant)
            // For now, we assume it returns { id, date, time, branch, level ... }
            const data = await supabaseService.fetchCoachSchedule(startOfMonth, endOfMonth);
            setSessions(data || []);

            // Extract unique branches for filter
            const uniqueBranches = [...new Set((data || []).map(s => s.branch).filter(Boolean))];
            setBranches(uniqueBranches);

            setLoading(false);
        };

        fetchSessions();
    }, [currentDate]);

    // Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const daysInMonth = getDaysInMonth(currentDate);

    // Filter Logic
    const selectedDaySessions = sessions.filter(s => {
        const d = new Date(s.date);
        const isDateMatch = d.getDate() === selectedDate.getDate() &&
            d.getMonth() === selectedDate.getMonth() &&
            d.getFullYear() === selectedDate.getFullYear();
        const isBranchMatch = activeFilter === 'All' || s.branch === activeFilter;
        return isDateMatch && isBranchMatch;
    });

    const handleManageSession = (session) => {
        navigate('/coach/session/' + session.id); // Updated route
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] bg-white overflow-hidden font-sans">

            {/* ---------------- LEFT PANEL: CALENDAR ---------------- */}
            <div className="flex-1 flex flex-col border-r border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">Schedule</h1>
                            <p className="text-slate-500 text-sm font-medium">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                                className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-600" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                                className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                            >
                                <ChevronRight size={20} className="text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Filters */}
                    {branches.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            <button
                                onClick={() => setActiveFilter('All')}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeFilter === 'All'
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                            >
                                All
                            </button>
                            {branches.map(branch => (
                                <button
                                    key={branch}
                                    onClick={() => setActiveFilter(branch)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${activeFilter === branch
                                        ? 'bg-white text-slate-800 border-slate-300 shadow-sm ring-1 ring-slate-200'
                                        : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${getColorForBranch(branch)}`}></div>
                                    {branch.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 border-t border-l border-slate-100">
                        {daysInMonth.map(day => {
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                            const daySessions = sessions.filter(s => {
                                const isDateMatch = s.date === dateStr;
                                const isBranchMatch = activeFilter === 'All' || s.branch === activeFilter;
                                return isDateMatch && isBranchMatch;
                            });

                            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                    className={`
                                        min-h-[100px] border-b border-r border-slate-100 p-2 cursor-pointer transition-all relative
                                        ${isSelected ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}
                                    `}
                                >
                                    <span className={`
                                        text-sm font-bold block mb-2 w-7 h-7 flex items-center justify-center rounded-full
                                        ${isSelected ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700'}
                                    `}>
                                        {day}
                                    </span>

                                    <div className="flex flex-wrap gap-1">
                                        {daySessions.map((session, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full ${getColorForBranch(session.branch)}`}
                                                title={session.branch}
                                            />
                                        ))}
                                    </div>

                                    {isSelected && <div className="absolute inset-0 border-2 border-emerald-500 pointer-events-none opacity-50"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ---------------- RIGHT PANEL: AGENDA ---------------- */}
            <div className="w-full md:w-[350px] bg-slate-50 border-l border-slate-200 flex flex-col shadow-xl z-10">
                <div className="p-6 bg-white border-b border-slate-100 sticky top-0 z-20">
                    <h2 className="text-xl font-black text-slate-800">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                    </h2>
                    <p className="text-emerald-600 font-bold">
                        {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedDaySessions.length > 0 ? (
                        selectedDaySessions.map(session => (
                            <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600`}>
                                        {session.level || 'Session'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{session.branch}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                    <Clock size={14} className="text-emerald-500" />
                                    {session.time}
                                </div>
                                <button
                                    onClick={() => handleManageSession(session)}
                                    className="w-full py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Manage Class
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
                            <div className="bg-slate-200 p-4 rounded-full mb-4">
                                <Coffee size={32} className="text-slate-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">No Classes Scheduled</h3>
                            <p className="text-sm text-slate-500 max-w-[200px] mb-6">
                                Enjoy your free time! Select another date to view sessions.
                            </p>
                            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                                <Plus size={16} /> Schedule Class
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Schedule;