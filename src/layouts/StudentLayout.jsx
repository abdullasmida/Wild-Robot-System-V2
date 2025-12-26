import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

// Using Material Symbols since lucide-react is not currently installed
// and we want to maintain consistency without adding dependencies unnecessarily
// If strict adherence to lucide is required, user should confirm to run npm install lucide-react

export default function StudentLayout() {
    const [isParentMode, setIsParentMode] = useState(false);
    const [progress, setProgress] = useState(0);
    const location = useLocation();

    // Timer refs
    const pressTimer = useRef(null);
    const inactivityTimer = useRef(null);
    const progressInterval = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });

    // Activity Monitor for Auto-Lock
    useEffect(() => {
        if (isParentMode) {
            resetInactivityTimer();
            window.addEventListener('mousemove', resetInactivityTimer);
            window.addEventListener('touchstart', resetInactivityTimer);
            window.addEventListener('click', resetInactivityTimer);
            window.addEventListener('keypress', resetInactivityTimer);
        } else {
            clearTimeout(inactivityTimer.current);
            window.removeEventListener('mousemove', resetInactivityTimer);
            window.removeEventListener('touchstart', resetInactivityTimer);
            window.removeEventListener('click', resetInactivityTimer);
            window.removeEventListener('keypress', resetInactivityTimer);
        }

        return () => {
            clearTimeout(inactivityTimer.current);
            window.removeEventListener('mousemove', resetInactivityTimer);
            window.removeEventListener('touchstart', resetInactivityTimer);
            window.removeEventListener('click', resetInactivityTimer);
            window.removeEventListener('keypress', resetInactivityTimer);
        };
    }, [isParentMode]);

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(() => {
            setIsParentMode(false); // Auto-Lock
        }, 5 * 60 * 1000); // 5 minutes
    };

    // Long Press Logic
    const startPress = () => {
        if (isParentMode) {
            // Instant Lock if already in parent mode
            setIsParentMode(false);
            return;
        }

        setProgress(0);
        let currentProgress = 0;

        progressInterval.current = setInterval(() => {
            currentProgress += 5; // Finish in roughly 2 seconds (5 * 20 = 100) -> interval 100ms
            setProgress(Math.min(currentProgress, 100));

            if (currentProgress >= 100) {
                clearInterval(progressInterval.current);
                setIsParentMode(true);
                setProgress(0);
            }
        }, 100); // 100ms tick * 20 ticks = 2000ms = 2 seconds to unlock
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        startPress();
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartPos.current.x;
        const deltaY = touch.clientY - touchStartPos.current.y;
        const distance = Math.hypot(deltaX, deltaY);

        // 10px Tolerance
        if (distance > 10) {
            endPress();
        }
    };

    const endPress = () => {
        clearInterval(progressInterval.current);
        setProgress(0);
    };

    // Security Check for Protected Pages
    const protectedRoutes = ['/athlete/billing', '/athlete/settings'];
    const isProtectedPage = protectedRoutes.some(route => location.pathname.startsWith(route));

    return (
        <div className={clsx("min-h-screen flex flex-col transition-colors duration-500", isParentMode ? "bg-slate-900" : "bg-blue-50")}>

            {/* Header */}
            <header className={clsx(
                "fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 transition-colors duration-500 shadow-sm",
                isParentMode ? "bg-slate-800 text-white" : "bg-white text-slate-800"
            )}>
                {/* Logo / Title */}
                <div className="flex items-center gap-2 font-black text-lg">
                    {isParentMode ? (
                        <>
                            <span className="material-symbols-outlined text-emerald-400">admin_panel_settings</span>
                            <span>Parent Mode</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-blue-500">face</span>
                            <span>Student Portal</span>
                        </>
                    )}
                </div>

                {/* Parent Gate Lock */}
                <button
                    onMouseDown={startPress}
                    onMouseUp={endPress}
                    onMouseLeave={endPress}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={endPress}
                    className="relative h-10 w-10 flex items-center justify-center rounded-full bg-opacity-10 transition-all select-none focus:outline-none"
                    style={{ backgroundColor: isParentMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                    aria-label={isParentMode ? "Lock Parent Mode" : "Unlock Parent Mode (Hold for 2 seconds)"}
                >
                    {/* Progress Circle SVG */}
                    {!isParentMode && progress > 0 && (
                        <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <path
                                className="text-gray-200"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="text-emerald-500 transition-all duration-100 ease-linear"
                                strokeDasharray={`${progress}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                    )}

                    <span className={clsx("material-symbols-outlined transition-all", isParentMode ? "text-emerald-400" : "text-slate-400")}>
                        {isParentMode ? 'lock_open' : 'lock'}
                    </span>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16 pb-20 px-4">
                {isProtectedPage && !isParentMode ? (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95">
                        <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-400">
                            <span className="material-symbols-outlined text-4xl">lock</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-500 mb-2">Parent Only Zone</h2>
                        <p className="text-slate-400 max-w-xs mx-auto">Hold the lock button in the top right to access these settings.</p>
                    </div>
                ) : (
                    <Outlet context={{ isParentMode }} />
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className={clsx(
                "fixed bottom-0 left-0 right-0 h-[70px] pb-safe border-t z-50 transition-colors duration-500",
                isParentMode ? "bg-slate-800 border-slate-700" : "bg-white border-blue-100"
            )}>
                <ul className="flex items-center justify-around h-full max-w-md mx-auto">

                    <StudentNavItem
                        to="/athlete"
                        icon="home"
                        label="Home"
                        end
                        isParentMode={isParentMode}
                    />

                    <StudentNavItem
                        to="/athlete/achievements"
                        icon="emoji_events"
                        label="Trophies"
                        isParentMode={isParentMode}
                    />

                    {isParentMode && (
                        <>
                            <StudentNavItem
                                to="/athlete/billing"
                                icon="credit_card"
                                label="Billing"
                                isParentMode={isParentMode}
                            />
                            <StudentNavItem
                                to="/athlete/settings"
                                icon="settings"
                                label="Settings"
                                isParentMode={isParentMode}
                            />
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
}

function StudentNavItem({ to, icon, label, isParentMode, end = false }) {
    return (
        <li className="flex-1 h-full">
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) => clsx(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                    isParentMode
                        ? (isActive ? "text-emerald-400" : "text-slate-500 hover:text-slate-300")
                        : (isActive ? "text-blue-500" : "text-slate-400 hover:text-blue-300")
                )}
            >
                <span className={clsx("material-symbols-outlined text-[26px]")}>
                    {icon}
                </span>
                <span className="text-[10px] font-bold">{label}</span>
            </NavLink>
        </li>
    );
}
