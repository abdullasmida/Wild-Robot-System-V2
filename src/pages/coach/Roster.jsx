import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Users, User, MapPin, MoreHorizontal, Mail, Phone, UserPlus } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import AddAthleteModal from '../../components/AddAthleteModal';

export default function Roster() {
    const [loading, setLoading] = useState(true);
    const [athletes, setAthletes] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [coachProfile, setCoachProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRoster();
    }, []);

    const fetchRoster = async () => {
        setLoading(true);
        try {
            // 1. Get Current Coach Info (needed for academy_name)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('academy_name')
                .eq('id', user.id)
                .single();

            // Fallback for metadata if profile incomplete
            const academyName = profile?.academy_name || user.user_metadata?.academy_name;
            setCoachProfile({ ...profile, academy_name: academyName });

            if (academyName) {
                // 2. Fetch Athletes linked to this Academy
                const { data: athleteData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'athlete')
                    .eq('academy_name', academyName)
                    .order('full_name', { ascending: true });

                if (error) throw error;
                setAthletes(athleteData || []);
            }
        } catch (error) {
            console.error('Error fetching roster:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtering
    const filteredAthletes = athletes.filter(p =>
        (p.full_name || '').toLowerCase().includes(filterName.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(filterName.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Users className="text-emerald-600" size={28} />
                        My Athletes
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Managing {athletes.length} profiles for <span className="text-emerald-600 font-bold">{coachProfile?.academy_name || 'Your Academy'}</span>
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Athlete
                </button>
            </div>

            {/* --- TOOLBAR --- */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search athletes by name or email..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    />
                </div>
                <button className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* --- CONTENT --- */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : athletes.length === 0 ? (

                /* --- EMPTY STATE --- */
                <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <UserPlus className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No Athletes Yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                        Your roster is looking a bit empty. Add your first athlete to start tracking their progress directly in Wild Robot.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1"
                    >
                        Add First Athlete
                    </button>
                </div>

            ) : (

                /* --- GRID VIEW --- */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAthletes.map((athlete) => (
                        <motion.div
                            key={athlete.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                    {athlete.full_name?.charAt(0) || 'A'}
                                </div>
                                <button className="text-slate-300 hover:text-slate-600">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <h3 className="font-bold text-slate-900 text-lg truncate mb-1">{athlete.full_name || 'Unnamed Athlete'}</h3>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Mail size={14} />
                                    <span className="truncate">{athlete.email}</span>
                                </div>
                                {athlete.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Phone size={14} />
                                        <span className="truncate">{athlete.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="px-2 py-1 rounded bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    {athlete.level || 'Bronze'}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                    Active
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 relative">
                                        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50"></span>
                                    </span>
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* --- MODAL --- */}
            <AddAthleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                academyName={coachProfile?.academy_name}
                onSuccess={() => fetchRoster()}
            />

        </div>
    );
}
