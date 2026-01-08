import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Plus, Trophy
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import EmptyState from '../../components/ui/EmptyState';
import BottomSheet from '../../components/ui/BottomSheet';
import AthleteCard from '../../components/cards/AthleteCard';
import AthleteInviteForm from '../../components/forms/AthleteInviteForm';

const AthletesRoster = () => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchHeroes = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            // Get academy first
            const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.id).single();

            if (profile?.academy_id) {
                const { data, error } = await supabase
                    .from('athletes')
                    .select('*')
                    .eq('academy_id', profile.academy_id)
                    .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`) // Search both
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setAthletes(data || []);
            }
        } catch (err) {
            console.error("Fetch errors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeroes();
    }, [searchQuery]); // Re-fetch on search

    const handleSuccess = () => {
        setIsSheetOpen(false);
        fetchHeroes(); // Refresh grid
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-emerald-500" />
                        Heroes Roster
                    </h1>
                    <p className="text-slate-500">Manage your athletes and their performance cards.</p>
                </div>

                {athletes.length > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search heroes..."
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold w-full md:w-64"
                            />
                        </div>
                        <button
                            onClick={() => setIsSheetOpen(true)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition active:scale-95 shadow-lg shadow-slate-900/10"
                        >
                            <Plus className="w-4 h-4" /> New Hero
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : athletes.length === 0 ? (
                <EmptyState
                    icon={Trophy}
                    title="No Heroes Founded"
                    description="Your roster is empty. Recruit your first athlete to start the journey."
                    actionLabel="Recruit First Hero"
                    onAction={() => setIsSheetOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {athletes.map(athlete => (
                        <AthleteCard key={athlete.id} athlete={athlete} />
                    ))}
                </div>
            )}

            {/* Sheet */}
            <BottomSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title="Recruit New Hero"
            >
                <AthleteInviteForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsSheetOpen(false)}
                />
            </BottomSheet>
        </div>
    );
};

export default AthletesRoster;
