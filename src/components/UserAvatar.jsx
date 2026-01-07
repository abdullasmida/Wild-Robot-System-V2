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

    // 2. Get Initials (Robust)
    const getInitials = () => {
        if (profile?.first_name && profile?.last_name) {
            return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
        }
        if (profile?.full_name) {
            return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user?.email?.substring(0, 2).toUpperCase() || "WR";
    };
    const initials = getInitials();

    // 3. Check for Owner Role
    const isOwner = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'super_admin';

    // 4. Dynamic Background Color
    // Priority: Profile Custom Color -> Academy Brand Color -> Random Gradient (Fallback)
    const bgColorStyle = profile?.avatar_color
        ? { backgroundColor: profile.avatar_color }
        : (profile?.academy?.brand_color ? { backgroundColor: profile.academy.brand_color } : {});

    const hasCustomColor = profile?.avatar_color || profile?.academy?.brand_color;

    // Fallback Gradients if no custom color
    const gradients = [
        "from-emerald-400 to-emerald-600",
        "from-blue-400 to-blue-600",
        "from-purple-400 to-purple-600",
        "from-amber-400 to-amber-600",
        "from-rose-400 to-rose-600"
    ];
    const gradientIndex = (initials.charCodeAt(0) + initials.charCodeAt(1)) % gradients.length;
    const bgGradient = gradients[gradientIndex];

    return (
        <div className={clsx("relative inline-block", className)}>
            <div
                className={clsx(
                    "rounded-2xl flex items-center justify-center font-black text-white shadow-lg ring-2 ring-white/50 overflow-hidden relative transition-all",
                    sizeClasses[size],
                    !profile?.avatar_url && !hasCustomColor && `bg-gradient-to-br ${bgGradient}`
                )}
                style={!profile?.avatar_url && hasCustomColor ? bgColorStyle : {}}
            >
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt={getInitials()}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="z-10 tracking-widest text-shadow-sm">{initials}</span>
                )}

                {/* Glassy Overlay for text readability */}
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
