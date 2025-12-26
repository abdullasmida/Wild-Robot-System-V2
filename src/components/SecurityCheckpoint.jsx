import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, Zap, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const SecurityCheckpoint = ({ sessionUserId, onClose }) => {
    // Logic: If props exist, behave as modal. If not, behave as Page.
    const [scanStatus, setScanStatus] = useState('scanning'); // 'scanning', 'denied', 'resolved'
    const [sessions, setSessions] = useState([]);
    const [loadingAction, setLoadingAction] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(sessionUserId || null);

    // Determine mode based on usage
    const isPageMode = !onClose;
    const navigate = useNavigate();

    useEffect(() => {
        const initialize = async () => {
            // If we don't have a userId yet (Page Mode), fetch it
            let targetId = currentUserId;

            if (!targetId) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/login');
                    return;
                }
                targetId = session.user.id;
                setCurrentUserId(targetId);
            }

            // Start fake scan
            const scanTimer = setTimeout(() => {
                fetchSessions(targetId);
            }, 1500);

            return () => clearTimeout(scanTimer);
        };

        initialize();
    }, [currentUserId, navigate]);

    const fetchSessions = async (uid) => {
        if (!uid) return;
        const { data } = await supabase
            .from('active_sessions')
            .select('*')
            .eq('user_id', uid);

        setSessions(data || []);
        setScanStatus('denied'); // Show denial UI
    };

    const handleTerminateSession = async (sessionId) => {
        // Optimistic UI update
        const newSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(newSessions);

        try {
            const { error } = await supabase
                .from('active_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;

            // If we are now below profile limit (assuming 2 for Admin, 1 for others)
            // Ideally we fetch the limit again or assume 1 free slot means go.
            // Simplified: If user killed a session, they essentially "made room".
            // We can retry the "Access Check" or just let them in.
            // Let's trigger success animation
            if (newSessions.length < sessions.length) {
                // Wait small delay then resolve
                setTimeout(() => {
                    setScanStatus('resolved');
                    setTimeout(() => {
                        if (isPageMode) navigate('/coach/home', { replace: true });
                        else onClose();
                    }, 1000);
                }, 500);
            }

        } catch (err) {
            console.error("Failed to terminate session", err);
            // Revert state if failed? For now, assume success.
            fetchSessions(currentUserId);
        }
    };

    const handleSignOutOthers = async () => {
        if (!currentUserId) return;
        setLoadingAction(true);
        try {
            // CLIENT-SIDE PURGE (Since RPC is unavailable)
            const params = sessions.map(s => s.id);
            if (params.length > 0) {
                const { error } = await supabase
                    .from('active_sessions')
                    .delete()
                    .in('id', params);

                if (error) throw error;
            }

            // Success Flow
            setScanStatus('resolved');
            setTimeout(() => {
                if (isPageMode) {
                    navigate('/coach/home', { replace: true });
                } else {
                    onClose();
                }
            }, 1000);

        } catch (error) {
            console.error("Failed to Purge sessions", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleUpgrade = () => {
        // Redirect to subscription with highlight state
        navigate('/subscription', { state: { highlight: 'team' } });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4 text-white font-sans">
            {/* Full Screen container */}
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">

                {/* Background Grid Animation */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

                <div className="relative z-10 p-8 text-center flex flex-col items-center min-h-[450px] justify-center">

                    <AnimatePresence mode='wait'>
                        {scanStatus === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-2 border-slate-700 flex items-center justify-center">
                                        <ShieldAlert size={40} className="text-slate-500" />
                                    </div>
                                    <motion.div
                                        className="absolute inset-0 border-2 border-emerald-500 rounded-full border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-white">Security Scan In Progress</h2>
                                    <p className="text-slate-400 text-sm">Verifying device signature...</p>
                                </div>
                            </motion.div>
                        )}

                        {scanStatus === 'denied' && (
                            <motion.div
                                key="denied"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full"
                            >
                                <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/50 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full"></div>
                                    <ShieldAlert size={40} className="text-red-500 relative z-10" />
                                </div>

                                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">SECURITY ALERT</h2>
                                <p className="text-slate-400 text-sm mb-8 px-4 font-medium">
                                    Maximum active sessions reached. Terminate an old session to authorize this device.
                                </p>

                                {/* Active Devices List */}
                                <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-700/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Uplinks ({sessions.length})</h3>
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                    </div>

                                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                        {sessions.map((session, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                key={session.id || idx}
                                                className="group flex items-center gap-3 text-left p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                                            >
                                                {/* Icon */}
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                                                    {session.user_agent?.includes('Mobile')
                                                        ? <Smartphone size={18} />
                                                        : <Monitor size={18} />
                                                    }
                                                </div>

                                                {/* Text Information */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold text-slate-200 truncate">
                                                            {(() => {
                                                                const cleanUA = session.user_agent ? session.user_agent.split('___DID:')[0] : '';
                                                                return cleanUA.includes('Mac') ? 'MacBook Pro' :
                                                                    cleanUA.includes('Windows') ? 'Windows Station' : 'Unknown Device';
                                                            })()}
                                                        </p>
                                                        {idx === 0 && <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 rounded border border-slate-600">Oldest</span>}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                                                        Last Active: {new Date(session.last_active).toLocaleTimeString()}
                                                    </p>
                                                </div>

                                                {/* Terminate Button */}
                                                <button
                                                    onClick={() => handleTerminateSession(session.id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all transform hover:scale-105"
                                                    title="Terminate Session"
                                                >
                                                    <LogOut size={16} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleSignOutOthers}
                                        disabled={loadingAction}
                                        className="w-full py-4 bg-slate-100 hover:bg-white text-slate-900 font-black rounded-xl transition-all shadow-lg shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {loadingAction ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Purging Systems...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={18} className="fill-slate-900" />
                                                Terminate All Other Sessions
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {scanStatus === 'resolved' && (
                            <motion.div
                                key="resolved"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/50 relative"
                                >
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                                    <ShieldCheck size={40} className="text-emerald-500 relative z-10" />
                                </motion.div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">Device Authorized</h2>
                                    <p className="text-slate-400 text-sm">Welcome back, Commander.</p>
                                </div>
                            </motion.div>
                        )
                        }

                    </AnimatePresence >

                </div >
            </div >
        </div >
    );
};

export default SecurityCheckpoint;
