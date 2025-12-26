import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch } from 'lucide-react'; // Fallback icon

const EmptyState = ({
    title = "No items found",
    description = "We couldn't find anything matching your criteria.",
    actionLabel,
    onAction,
    imageSrc = "/wibo_assets/Placeholders/empty_box.png" // Potential future asset
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 min-h-[400px]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 relative"
            >
                {/* 
                    If you have a custom illustration, use <img>. 
                    For now, we build a beautiful CSS/Icon composition.
                */}
                <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200 mx-auto">
                    <div className="absolute inset-0 bg-emerald-50 rounded-full animate-pulse opacity-50"></div>
                    <FileSearch className="w-12 h-12 text-slate-300 relative z-10" />

                    {/* Decorative Elements */}
                    <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                    <div className="absolute bottom-4 left-2 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
                </div>
            </motion.div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-sm mb-8">{description}</p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
