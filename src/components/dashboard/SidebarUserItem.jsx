import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function SidebarUserItem() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUser(data);
            }
        }
        getUser();
    }, []);

    return (
        <div
            onClick={() => navigate('/owner/profile')}
            className="mt-auto pt-4 border-t border-slate-800/50 cursor-pointer group px-2"
        >
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200">
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md border border-slate-700 overflow-hidden shrink-0">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span>{user?.first_name?.[0] || 'O'}</span>
                        )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0 transition-opacity duration-300">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                        {user?.first_name || 'Owner'} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate group-hover:text-blue-400">View Profile</p>
                </div>
            </div>
        </div>
    );
}
