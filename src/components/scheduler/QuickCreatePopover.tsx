import React, { useState } from 'react';
import { Clock, MapPin, Users, X, ChevronRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react'; // Just in case, but we might just use absolute div

interface QuickCreatePopoverProps {
    date: Date;
    onClose: () => void;
    onCreate: (data: any) => Promise<void>;
    onMoreOptions: () => void;
    locations: any[];
}

export const QuickCreatePopover = ({ date, onClose, onCreate, onMoreOptions, locations }: QuickCreatePopoverProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        startTime: '09:00',
        endTime: '13:00',
        locationId: locations[0]?.id || '',
        quantity: 1,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onCreate({
            ...formData,
            date: date
        });
        setIsLoading(false);
    };

    return (
        <div
            className="absolute z-50 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 ring-4 ring-slate-400/10 animate-in fade-in zoom-in-95 duration-200 origin-top-left"
            style={{ top: '100%', left: '0' }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center gap-2 text-emerald-600">
                    <Sparkles className="w-3.5 h-3.5 fill-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-wider">New Open Shift</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-white rounded-full transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-3 space-y-3">

                {/* Time Row */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full text-xs font-bold pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                    <span className="text-slate-300 font-bold text-xs">-</span>
                    <div className="flex-1 relative">
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full text-xs font-bold px-2 py-2 text-center bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                </div>

                {/* Location Select */}
                <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <select
                        value={formData.locationId}
                        onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                        className="w-full text-xs font-bold pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none truncate"
                    >
                        {locations.length === 0 && <option value="">No Locations</option>}
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-2.5 pointer-events-none">
                        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                    <div className="w-16 relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold text-xs">x</span>
                        </div>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            className="w-full text-xs font-bold pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Coach(es) Needed
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onMoreOptions}
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        More Options
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[1.5] px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating...' : <>Quick Create <ChevronRight className="w-3 h-3" /></>}
                    </button>
                </div>

            </form>
        </div>
    );
};
