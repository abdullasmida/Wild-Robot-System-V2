import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { LogOut, User, ChevronDown } from 'lucide-react';

export default function SidebarUserItem({ theme = 'light', condensed = false }) {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const { viewMode, toggleViewMode } = useAppStore();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const wrapperRef = React.useRef(null);

    // Close on click outside
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    if (!user) return null;

    const isDark = theme === 'dark';
    const academyName = user.role === 'owner' ? user.academy?.name || 'Wild Robot' : null;

    // --- SHARED MENU CONTENT ---
    const MenuContent = () => (
        <div className={`
            absolute 
            ${condensed ? 'top-12 right-0 w-56' : 'bottom-full left-0 w-full mb-2'} 
            rounded-xl overflow-hidden shadow-xl border 
            animate-in fade-in zoom-in-95 duration-200 z-50
            ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}
        `}>
            <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Signed in as</p>
                <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.email}</p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); navigate(user.role === 'owner' ? '/owner/settings' : '/staff/profile'); }}
                className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-3 ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <User className="w-4 h-4" /> Profile Settings
            </button>
            {user.role === 'owner' && (
                <button
                    onClick={(e) => { e.stopPropagation(); toggleViewMode(); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-3 ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[16px] leading-none">{viewMode === 'floor' ? 'storefront' : 'exercise'}</span>
                    {viewMode === 'floor' ? 'Exit Floor Mode' : 'Floor Mode'}
                </button>
            )}
            <div className={`h-[1px] ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <button
                onClick={handleSignOut}
                className={`w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3`}
            >
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
    );

    // --- CONDENSED MODE (Header) ---
    if (condensed) {
        return (
            <div ref={wrapperRef} className="relative">
                <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 cursor-pointer group select-none"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">
                            {user.first_name} {user.last_name}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                            {user.role?.replace('_', ' ')}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-100 group-hover:ring-emerald-500 transition-all">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs tracking-wider">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </div>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                    </div>
                </div>
                {isMenuOpen && <MenuContent />}
            </div>
        );
    }

    // --- EXPANDED MODE (Sidebar) ---
    return (
        <div ref={wrapperRef} className="w-full relative">
            <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`
                    relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent select-none
                    ${isDark
                        ? 'hover:bg-slate-800/80 hover:border-slate-700/50'
                        : 'hover:bg-white hover:shadow-sm hover:border-slate-200'}
                `}
            >
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${isDark ? 'ring-slate-700/50' : 'ring-white shadow-sm'}`}>
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-sm font-bold tracking-wider ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <span className={`text-sm font-semibold truncate leading-tight ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                        {user.first_name} {user.last_name}
                    </span>
                    <span className={`text-xs truncate font-medium mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {user.role === 'owner' ? (
                            <span className="flex items-center gap-1">Owner {academyName && `| ${academyName}`}</span>
                        ) : (
                            <span className="capitalize">{user.role?.replace('_', ' ')}</span>
                        )}
                    </span>
                </div>

                <div className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
            </div>
            {isMenuOpen && <MenuContent />}
        </div>
    );
}
