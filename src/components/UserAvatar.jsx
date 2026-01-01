import React from 'react';
import { Crown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function UserAvatar({ user, profile, size = 'md', className }) {
    // 1. Determine Size Classes
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-xl",
        xl: "h-32 w-32 text-4xl"
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 18,
        xl: 32
    };

    // 2. Get Initials
    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (user?.email?.charAt(0).toUpperCase() || "WR");

    // 3. Check for Owner Role
    const isOwner = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'super_admin';

    // 4. Random Gradient for Initials (Consistent based on name length)
    const gradients = [
        "from-emerald-400 to-emerald-600",
        "from-blue-400 to-blue-600",
        "from-purple-400 to-purple-600",
        "from-amber-400 to-amber-600",
        "from-rose-400 to-rose-600"
    ];
    const gradientIndex = (profile?.full_name?.length || 0) % gradients.length;
    const bgGradient = gradients[gradientIndex];

    return (
        <div className={clsx("relative inline-block", className)}>
            <div className={clsx(
                "rounded-2xl flex items-center justify-center font-black text-white shadow-lg ring-2 ring-white overflow-hidden relative",
                sizeClasses[size],
                profile?.avatar_url ? "bg-slate-100" : `bg-gradient-to-br ${bgGradient}`
            )}>
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "User"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="z-10">{initials}</span>
                )}

                {/* Subtle pattern overlay for initials */}
                {!profile?.avatar_url && (
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                )}
            </div>

            {/* 👑 CROWN BADGE FOR OWNERS */}
            {isOwner && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 bg-gradient-to-b from-yellow-300 to-yellow-500 text-yellow-900 p-1 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-20"
                >
                    <Crown size={iconSizes[size]} strokeWidth={2.5} fill="currentColor" className="text-yellow-900/80" />
                </motion.div>
            )}
        </div>
    );
}
