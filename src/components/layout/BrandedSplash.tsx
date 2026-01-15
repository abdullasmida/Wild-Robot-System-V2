import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Academy } from '@/types/custom'; // Assuming types are here or similar

interface BrandedSplashProps {
    academy: Academy | null;
    isLoading: boolean;
}

export const BrandedSplash: React.FC<BrandedSplashProps> = ({ academy, isLoading }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (!isLoading) {
            // Wait for transition before unmounting visually
            timeout = setTimeout(() => {
                setIsVisible(false);
            }, 800);
        }
        return () => clearTimeout(timeout);
    }, [isLoading]);

    if (!isVisible) return null;

    // Default Brand Color: Emerald-500 (#10b981)
    const brandColor = academy?.brand_color || '#10b981';

    // Initials logic if no logo
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AnimatePresence>
            {(isLoading || isVisible) && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: isLoading ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900"
                >
                    <div className="flex flex-col items-center gap-6">
                        {/* Logo or Initials */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            {academy?.logo_url ? (
                                <img
                                    src={academy.logo_url}
                                    alt={academy.name}
                                    className="w-24 h-24 object-contain"
                                />
                            ) : (
                                <div
                                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    {academy?.name ? getInitials(academy.name) : 'WR'}
                                </div>
                            )}
                        </motion.div>

                        {/* Academy Name */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {academy?.name || 'Wild Robot System'}
                            </h1>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                                Intelligent Gym OS
                            </p>
                        </div>

                        {/* Custom Loader Bar */}
                        <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: brandColor }}
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-50">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            Powered by Wild Robot
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
