import React, { useEffect, useState } from 'react';
import { Users, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import UserAvatar from '../../ui/UserAvatar';

const MyAthletesWidget = () => {
    const { user } = useAuthStore();
    const [athletes, setAthletes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAthletes = async () => {
            if (!user?.academy_id) return;
            try {
                // Fetch first 5 athletes
                const { data, error } = await supabase
                    .from('athletes')
                    .select('*')
                    .eq('academy_id', user.academy_id)
                    .limit(4)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setAthletes(data || []);
            } catch (err) {
                console.error("Error fetching homepage athletes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAthletes();
    }, [user]);

    if (loading) return <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    My Roster
                </h2>
                <Link to="/workspace/athletes" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    View All
                </Link>
            </div>

            <div className="divide-y divide-slate-100">
                {athletes.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                        No athletes assigned yet.
                    </div>
                ) : (
                    athletes.map(athlete => (
                        <div key={athlete.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                                    {(athlete.first_name?.[0] || 'A') + (athlete.last_name?.[0] || 'A')}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {athlete.first_name} {athlete.last_name}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                                            {athlete.level || 'Beginner'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                    ))
                )}
            </div>
            {athletes.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <Link to="/workspace/athletes" className="text-xs font-medium text-slate-500 hover:text-slate-900 block w-full">
                        Manage {athletes.length} Athletes
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyAthletesWidget;
