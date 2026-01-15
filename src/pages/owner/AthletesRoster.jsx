import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Plus, Trophy
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuthStore } from '../../stores/useAuthStore';
import EmptyState from '../../components/ui/EmptyState';
import BottomSheet from '../../components/ui/BottomSheet';
import AthleteCard from '../../components/cards/AthleteCard';
import AthleteInviteForm from '../../components/forms/AthleteInviteForm';

const AthletesRoster = () => {
    // 1. استدعاء اليوزر من الستور عشان نتجنب الـ ReferenceError
    const { user } = useAuthStore();

    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchHeroes = async () => {
        setLoading(true);
        try {
            // بنجيب بيانات اليوزر الحالي من السوبابيز
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) return;

            // بنجيب الأكاديمية
            const { data: profile } = await supabase
                .from('profiles')
                .select('academy_id')
                .eq('id', authUser.id)
                .single();

            if (profile?.academy_id) {
                let query = supabase
                    .from('athletes')
                    .select('*')
                    .eq('academy_id', profile.academy_id)
                    .order('created_at', { ascending: false });

                // لو فيه بحث، بنفلتر النتائج
                if (searchQuery) {
                    query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
                }

                const { data, error } = await query;

                if (error) throw error;

                // تنسيق البيانات
                const sanitized = (data || []).map(a => ({
                    ...a,
                    full_name: `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Unknown Hero'
                }));
                setAthletes(sanitized);
            }
        } catch (err) {
            console.error("Fetch errors:", err);
        } finally {
            setLoading(false);
        }
    };

    // إعادة البحث لما نكتب في السيرش
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHeroes();
        }, 500); // Debounce عشان ميعملش ريكويست مع كل حرف
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSuccess = () => {
        setIsSheetOpen(false);
        fetchHeroes();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-emerald-500" />
                        Heroes Roster
                    </h1>
                    <p className="text-slate-500">Manage your athletes and their performance cards.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 2. زرار البحث: يظهر للجميع (أونر وكوتش) طالما فيه لاعبين */}
                    {athletes.length > 0 && (
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search heroes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all w-full md:w-64"
                            />
                        </div>
                    )}

                    {/* 3. زرار الإضافة: يظهر للـ Owner فقط */}
                    {user?.role === 'owner' && (
                        <button
                            onClick={() => setIsSheetOpen(true)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition active:scale-95 shadow-lg shadow-slate-900/10"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden md:inline">New Hero</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Section */}
            {loading && athletes.length === 0 ? (
                // حالة التحميل الأولية
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : athletes.length === 0 && !searchQuery ? (
                // حالة مفيش بيانات خالص
                <EmptyState
                    icon={Trophy}
                    title="No Heroes Found"
                    description="Your roster is empty. Recruit your first athlete to start the journey."
                    actionLabel={user?.role === 'owner' ? "Recruit First Hero" : undefined}
                    onAction={user?.role === 'owner' ? () => setIsSheetOpen(true) : undefined}
                />
            ) : (
                // حالة عرض الكروت
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {athletes.map(athlete => (
                        <AthleteCard key={athlete.id} athlete={athlete} />
                    ))}
                </div>
            )}

            {/* Add Hero Modal */}
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