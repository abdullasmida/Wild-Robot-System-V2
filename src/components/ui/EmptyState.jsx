import React from 'react';
import { Ghost } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Ghost,
    title = "Nothing to see here",
    description = "It's a bit empty. Ready to start building?",
    actionLabel,
    onAction
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 min-h-[400px]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <Icon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-sm mb-8">{description}</p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
