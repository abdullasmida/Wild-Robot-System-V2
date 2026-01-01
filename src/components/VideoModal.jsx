import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function VideoModal({ isOpen, onClose, videoId = "dQw4w9WgXcQ" }) {
    if (!isOpen) return null;

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
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl aspect-video relative pointer-events-auto border border-emerald-500/20">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Embed */}
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title="Wild Robot Demo"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
