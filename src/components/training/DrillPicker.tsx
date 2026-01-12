import React, { useState, useEffect } from 'react';
import { X, Search, Dumbbell, Star, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface DrillPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: any) => void;
    initialType?: 'drill' | 'skill';
}

const DrillPicker = ({ isOpen, onClose, onSelect, initialType = 'drill' }: DrillPickerProps) => {
    const [activeTab, setActiveTab] = useState<'drill' | 'skill'>(initialType);
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchItems();
        }
    }, [isOpen, activeTab, searchQuery]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const table = activeTab === 'drill' ? 'drills' : 'skills';
            let query = supabase
                .from(table)
                .select('*')
                .limit(20);

            if (searchQuery) {
                query = query.ilike('title', `%${searchQuery}%`); // Note: 'skills' has 'name', 'drills' has 'title'. Need to handle this.
            }

            // Adjust query based on table schema differences
            // Skills: name, drills: title
            // Let's fix this in the query or post-process? 
            // Better to conditionally check.
            if (activeTab === 'skill' && searchQuery) {
                query = supabase.from('skills').select('*').ilike('name', `%${searchQuery}%`).limit(20);
            } else if (activeTab === 'drill' && searchQuery) {
                query = supabase.from('drills').select('*').ilike('title', `%${searchQuery}%`).limit(20);
            }

            const { data, error } = await query;
            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Add to Plan</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="p-4 space-y-4 border-b border-slate-100">
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setActiveTab('drill')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'drill' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Dumbbell className="w-4 h-4" /> Drills
                        </button>
                        <button
                            onClick={() => setActiveTab('skill')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'skill' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Star className="w-4 h-4" /> Skills
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeTab}s...`}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm font-medium">Searching Library...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="font-medium">No results found</p>
                            <p className="text-sm">Try a different search term</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    onSelect({
                                        ...item,
                                        type: activeTab // Inject type so parent knows
                                    });
                                    onClose();
                                }}
                                className="group flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all"
                            >
                                {/* Thumbnail / Icon */}
                                <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {item.preview_url ? (
                                        <img src={item.preview_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            {activeTab === 'drill' ? <Dumbbell className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                                        {item.title || item.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 truncate">
                                        {item.description || 'No description'}
                                    </p>
                                </div>

                                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default DrillPicker;
