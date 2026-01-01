import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Building2, MapPin, Loader } from 'lucide-react';

const CreateAcademyModal = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // 2. Create Academy
            const { data: academy, error: academyError } = await supabase
                .from('academies')
                .insert([{
                    name,
                    location,
                    owner_id: user.id,
                    subscription_status: 'trial'
                }])
                .select()
                .single();

            if (academyError) throw academyError;

            // 3. Link Owner to Academy
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ academy_id: academy.id, role: 'owner' })
                .eq('id', user.id);

            if (profileError) throw profileError;

            onSuccess();
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create academy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Setup Academy</h2>
                        <p className="text-sm text-slate-500">Launch your new kingdom</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Academy Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wild Robot Gym" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dubai" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg flex justify-center items-center gap-2">
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Launch Academy 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAcademyModal;
