import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { ShieldCheck, Calendar, Info } from 'lucide-react';

export default function HQSettings() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        config_enable_open_shifts: false
    });

    useEffect(() => {
        if (profile?.academy_id) {
            fetchSettings();
        }
    }, [profile]);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('academies')
                .select('config_enable_open_shifts')
                .eq('id', profile?.academy_id)
                .single();

            if (error) throw error;
            if (data) {
                setSettings({ config_enable_open_shifts: data.config_enable_open_shifts });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Don't toast on load to avoid spam, just log
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key: keyof typeof settings) => {
        const newValue = !settings[key];
        // Optimistic UI
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const { error } = await supabase
                .from('academies')
                .update({ [key]: newValue })
                .eq('id', profile?.academy_id);

            if (error) {
                // Revert
                setSettings(prev => ({ ...prev, [key]: !newValue }));
                throw error;
            }
            toast.success("Settings Updated");
        } catch (error) {
            toast.error("Failed to update settings");
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900">HQ Settings</h1>
                <p className="text-slate-500 font-medium">Configure your academy modules and preferences.</p>
            </div>

            {/* Scheduler Configuration */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Scheduler Configuration</h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Open Shifts Toggle */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900">Enable Open Shifts</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${settings.config_enable_open_shifts ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {settings.config_enable_open_shifts ? 'ACTIVE' : 'DISABLED'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                                Allow creating "Open Shifts" that staff can claim.
                                <br />
                                <span className="text-xs italic text-slate-400">
                                    When disabled, the "Open Shifts" row is hidden from the schedule.
                                </span>
                            </p>
                        </div>

                        {/* Toggle */}
                        <button
                            onClick={() => toggleSetting('config_enable_open_shifts')}
                            className={`
                                relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                                ${settings.config_enable_open_shifts ? 'bg-emerald-500' : 'bg-slate-200'}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
                                    ${settings.config_enable_open_shifts ? 'translate-x-6' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Alert Info for Context */}
                    {!settings.config_enable_open_shifts && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-700">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>
                                <strong>Tip:</strong> Keep this disabled if you explicitly assign all shifts to staff members. Eliminate clutter by hiding features you don't use.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Other Settings (Future Placeholder) */}
            <div className="opacity-50 pointer-events-none grayscale select-none">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Payroll & Finance (Coming Soon)</h2>
                    </div>
                    <div className="p-6 text-slate-400 text-sm italic">
                        Configure pay rates, overtime rules, and currency...
                    </div>
                </div>
            </div>
        </div>
    );
}
