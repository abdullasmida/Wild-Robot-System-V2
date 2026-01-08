import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import UserAvatar from '../ui/UserAvatar';

export default function SidebarUserItem() {
    const navigate = useNavigate();
    const { user: profile } = useAuthStore();

    if (!profile) {
        return (
            <div className="flex items-center gap-3 p-2 animate-pulse w-full">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-2 bg-slate-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    // Fallback if no profile is found but not loading (should theoretically not happen if auth is strictly checked, but safe to have)
    const displayProfile = profile || {
        first_name: 'Guest',
        last_name: 'User',
        role: 'visitor',
        email: 'guest@example.com'
    };

    return (
        <div className="space-y-2">
            <button
                onClick={() => navigate('/owner/profile')}
                className="flex items-center gap-3 w-full p-2 hover:bg-white rounded-lg transition-colors text-left group border border-transparent hover:border-slate-200 hover:shadow-sm"
            >
                <UserAvatar
                    profile={displayProfile}
                    size="md"
                    className="ring-1 ring-slate-200 group-hover:ring-slate-300 transition-colors"
                    showTooltip={false}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-700 group-hover:text-slate-900">
                        {displayProfile.first_name || 'User'} {displayProfile.last_name || ''}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                        {displayProfile.role === 'owner' ? 'Academy Owner' : (displayProfile.role === 'visitor' ? 'Guest Access' : 'Staff Member')}
                    </p>
                </div>
            </button>

            {/* Operator Mode Toggle (Only for Owners/Staff) */}
            {['owner', 'head_coach', 'coach'].includes(displayProfile.role) && (
                <OperatorToggle />
            )}
        </div>
    );
}

function OperatorToggle() {
    const { viewMode, toggleViewMode } = useAppStore();
    const isFloorMode = viewMode === 'floor';

    return (
        <button
            onClick={toggleViewMode}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${isFloorMode
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:bg-blue-600'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
        >
            <span className="material-symbols-outlined text-[16px]">
                {isFloorMode ? 'exercise' : 'storefront'}
            </span>
            {isFloorMode ? 'Exit Floor Mode' : 'Enter Floor Mode'}
        </button>
    );
}
