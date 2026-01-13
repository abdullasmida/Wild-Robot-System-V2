import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, Plus, Dumbbell, ClipboardList } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import SkillCard from '../../components/cards/SkillCard';
import AddSkillModal from '../../components/modals/AddSkillModal';
// import { Skill } from '../../types/training';

const SkillLibrary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [skills, setSkills] = useState<any[]>([]); // Using any[] for now to speed up dev
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApparatus, setSelectedApparatus] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, [searchQuery, selectedApparatus]);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            // Fetch skills with joined Apparatus and Level
            let query = supabase
                .from('skills')
                .select(`
            *,
            apparatus:apparatus_id(name, icon_url),
            level:level_id(name, order)
        `)
                .order('created_at', { ascending: false });

            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            // If specialized filter needed
            // if (selectedApparatus) query = query.eq('apparatus.name', selectedApparatus);

            const { data, error } = await query;
            if (error) throw error;
            setSkills(data || []);
        } catch (err) {
            console.error('Error fetching skills:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = () => {
        if (location.pathname.startsWith('/staff')) {
            navigate('/staff/training/builder');
        } else {
            navigate('/command/training/builder');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up p-6">
            <AddSkillModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSkillAdded={fetchSkills}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-emerald-500" />
                        Skill Library
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Mastery starts here. Browse the official curriculum and drills.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search skills..."
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium w-full md:w-80 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={handleCreatePlan}
                        className="bg-white text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition active:scale-95"
                    >
                        <ClipboardList className="w-5 h-5" /> Create Plan
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-slate-900/20"
                    >
                        <Plus className="w-5 h-5" /> New Skill
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : skills.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-2">
                        <Dumbbell className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">No Skills Found</h3>
                        <p className="text-slate-500">Try adjusting your search or add a new skill.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {skills.map((skill) => (
                        <SkillCard key={skill.id} skill={skill} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillLibrary;
