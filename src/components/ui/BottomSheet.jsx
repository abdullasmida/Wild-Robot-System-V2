import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BottomSheet = ({ isOpen, onClose, title, children }) => {
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-colors"
                    />

                    {/* Sheet / Modal */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center justify-end pointer-events-none sm:justify-center sm:inset-y-0"
                    >
                        {/* Container: 75% height on mobile, Centered on desktop */}
                        <div
                            className="w-full h-[85vh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drag Handle (Mobile Visual Only) */}
                            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing">
                                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-0">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
