import React from 'react';

interface SaaSBrandHeaderProps {
    theme?: 'light' | 'dark';
}

export const SaaSBrandHeader = ({ theme = 'dark' }: SaaSBrandHeaderProps) => (
    <div className={`h-16 flex items-center px-6 border-b ${theme === 'dark' ? 'border-slate-800/50' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-emerald-500/20' : 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" /><path d="M2 17L12 22L22 17" /><path d="M2 12L12 17L22 12" />
                </svg>
            </div>
            {/* Logo Text */}
            <div className="flex flex-col">
                <span className={`text-lg font-black tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>WILD ROBOT</span>
                <span className={`text-[10px] font-medium tracking-widest uppercase ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>Intelligent Gym OS</span>
            </div>
        </div>
    </div>
);
