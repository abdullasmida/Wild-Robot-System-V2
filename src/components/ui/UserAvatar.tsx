import React from 'react';
import { Crown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Profile {
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    role?: string | null;
    avatar_color?: string | null;
    email?: string | null;
}

interface UserAvatarProps {
    profile?: Profile | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showTooltip?: boolean;
}

export default function UserAvatar({ profile, size = 'md', className, showTooltip = true }: UserAvatarProps) {
    if (!profile) return null;

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl'
    };

    const initial = profile.first_name ? profile.first_name[0].toUpperCase() : (profile.email ? profile.email[0].toUpperCase() : '?');
    const bgColor = profile.avatar_color || '#10b981'; // Default Emerald
    const isOwner = profile.role === 'owner' || profile.role === 'admin';
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'User';

    return (
        <div className={cn("relative group cursor-pointer", className)} title={showTooltip ? fullName : undefined}>
            <div
                className={cn(
                    "rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white",
                    sizeClasses[size]
                )}
                style={{ backgroundColor: profile.avatar_url ? 'transparent' : bgColor }}
            >
                {profile.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt={fullName}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <span>{initial}</span>
                )}
            </div>

            {/* Owner Crown Badge */}
            {isOwner && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 rounded-full p-0.5 shadow-md ring-1 ring-white">
                    <Crown size={size === 'sm' ? 8 : 12} strokeWidth={3} />
                </div>
            )}

            {/* Tooltip (Simple browser tooltip used via title attr, can be enhanced) */}
        </div>
    );
}
