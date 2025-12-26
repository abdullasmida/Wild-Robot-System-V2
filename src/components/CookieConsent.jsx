import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, BarChart, Zap, X, Check, ChevronRight, Settings, Camera, Mic, MapPin, Bell, Globe } from 'lucide-react';

const CookieConsent = () => {
    // STEPS: 'init' (hidden), 'banner' (small), 'preferences' (cookies), 'permissions' (hardware), 'finish'
    const [step, setStep] = useState('init');
    const [showDetails, setShowDetails] = useState(false);

    // Cookie State
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false
    });

    // Permission State
    const [permissions, setPermissions] = useState({
        location: 'prompt', // prompt, granted, denied
        camera: 'prompt',
        microphone: 'prompt',
        notifications: 'prompt'
    });

    useEffect(() => {
        // Check local storage for initial "Done" state
        const savedConsent = localStorage.getItem('wibo_privacy_setup_v2');
        if (!savedConsent) {
            const timer = setTimeout(() => setStep('banner'), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    // ----------------------------------------------------
    // COOKIE LOGIC
    // ----------------------------------------------------
    const handleAcceptAllCookies = () => {
        setPreferences({ necessary: true, analytics: true, marketing: true, functional: true });
        // Move to permissions step instead of closing immediately
        setStep('permissions');
    };

    const handleRejectCookies = () => {
        setPreferences({ necessary: true, analytics: false, marketing: false, functional: false });
        setStep('permissions');
    };

    const toggleCookie = (key) => {
        if (key === 'necessary') return;
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ----------------------------------------------------
    // PERMISSION LOGIC (The "World Class" Hardware Request)
    // ----------------------------------------------------
    const requestLocation = async () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            () => setPermissions(prev => ({ ...prev, location: 'granted' })),
            () => setPermissions(prev => ({ ...prev, location: 'denied' }))
        );
    };

    const requestMedia = async (type) => { // type: 'camera' | 'microphone'
        try {
            const constraints = type === 'camera' ? { video: true } : { audio: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Success! Now stop the tracks immediately so we don't keep the light on
            stream.getTracks().forEach(track => track.stop());

            setPermissions(prev => ({ ...prev, [type]: 'granted' }));
        } catch (err) {
            console.error(`${type} denied`, err);
            setPermissions(prev => ({ ...prev, [type]: 'denied' }));
        }
    };

    const requestNotifications = async () => {
        if (!("Notification" in window)) return;
        const result = await Notification.requestPermission();
        setPermissions(prev => ({ ...prev, notifications: result }));
    };

    // ----------------------------------------------------
    // FINALIZE
    // ----------------------------------------------------
    const finishSetup = () => {
        localStorage.setItem('wibo_privacy_setup_v2', JSON.stringify({
            preferences,
            permissions, // Just for record, mostly browser handles this
            timestamp: new Date().toISOString()
        }));
        setStep('finish');
        setTimeout(() => setStep('done'), 2000); // Hide after success animation
    };

    if (step === 'init' || step === 'done') return null;

    return (
        <AnimatePresence mode='wait'>
            {/* BACKDROP for Modal Steps */}
            {(step === 'preferences' || step === 'permissions') && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
                />
            )}

            {/* MAIN CONTAINER */}
            <motion.div
                key={step}
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`fixed z-[9999] 
                    ${step === 'banner' ? 'bottom-6 right-6 w-full max-w-sm' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl'}
                `}
            >
                <div className={`
                    bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden
                    ${step === 'banner' ? 'rounded-2xl' : 'rounded-3xl'}
                `}>
                    {/* ----------------- STEP: BANNER ----------------- */}
                    {step === 'banner' && (
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <Shield size={24} className="text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">System Access</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        We need your permission to initialize the full Wild Robot experience (Hardware & Data).
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('preferences')}
                                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition"
                                >
                                    Customize
                                </button>
                                <button
                                    onClick={handleAcceptAllCookies}
                                    className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20"
                                >
                                    Allow All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ----------------- STEP: COOKIE PREFERENCES ----------------- */}
                    {step === 'preferences' && (
                        <div className="p-8">
                            <StepHeader title="Data Preferences" subtitle="Customize how we collect usage data." step={1} total={2} />

                            <div className="space-y-4 my-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                <PreferenceRow
                                    icon={<Shield size={20} className="text-emerald-500" />}
                                    title="Strictly Necessary"
                                    desc="Required for security and authentication."
                                    active={true}
                                    locked={true}
                                />
                                <PreferenceRow
                                    icon={<BarChart size={20} className="text-blue-500" />}
                                    title="Analytics"
                                    desc="Help us improve implementation logic."
                                    active={preferences.analytics}
                                    onClick={() => toggleCookie('analytics')}
                                />
                                <PreferenceRow
                                    icon={<Zap size={20} className="text-amber-500" />}
                                    title="Functional"
                                    desc="Remember your settings and UI choices."
                                    active={preferences.functional}
                                    onClick={() => toggleCookie('functional')}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
                                <button onClick={() => setStep('permissions')} className="text-slate-400 font-bold hover:text-white transition">Skip</button>
                                <button
                                    onClick={() => setStep('permissions')}
                                    className="px-8 py-3 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 transition flex items-center gap-2"
                                >
                                    Next: Hardware <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ----------------- STEP: HARDWARE PERMISSIONS ----------------- */}
                    {step === 'permissions' && (
                        <div className="p-8">
                            <StepHeader title="Device Access" subtitle="Enable hardware execution features." step={2} total={2} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                                <PermissionCard
                                    icon={<MapPin />}
                                    title="Location"
                                    status={permissions.location}
                                    onClick={requestLocation}
                                />
                                <PermissionCard
                                    icon={<Camera />}
                                    title="Camera"
                                    status={permissions.camera}
                                    onClick={() => requestMedia('camera')}
                                />
                                <PermissionCard
                                    icon={<Mic />}
                                    title="Microphone"
                                    status={permissions.microphone}
                                    onClick={() => requestMedia('microphone')}
                                />
                                <PermissionCard
                                    icon={<Bell />}
                                    title="Notifications"
                                    status={permissions.notifications}
                                    onClick={requestNotifications}
                                />
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-800">
                                <button
                                    onClick={finishSetup}
                                    className="w-full md:w-auto px-8 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Launch Interface
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ----------------- STEP: FINISH ----------------- */}
                    {step === 'finish' && (
                        <div className="p-12 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <Check size={48} className="text-emerald-500" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-white mb-2">Access Granted</h2>
                            <p className="text-slate-400">System initialization complete.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// SUB-COMPONENTS
const StepHeader = ({ title, subtitle, step, total }) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-white">{title}</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">STEP {step}/{total}</span>
        </div>
        <p className="text-slate-400">{subtitle}</p>
    </div>
);

const PreferenceRow = ({ icon, title, desc, active, locked, onClick }) => (
    <div
        onClick={!locked ? onClick : undefined}
        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${active ? 'bg-slate-800 border-emerald-500/30' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}
    >
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {icon}
            </div>
            <div>
                <h4 className={`font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    </div>
);

const PermissionCard = ({ icon, title, status, onClick }) => {
    const isGranted = status === 'granted';
    const isDenied = status === 'denied';

    return (
        <button
            onClick={!isGranted ? onClick : undefined}
            disabled={isDenied}
            className={`
                p-4 rounded-xl border text-left transition-all relative overflow-hidden group
                ${isGranted ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
                ${isDenied ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${isGranted ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-white'}`}>
                    {icon}
                </div>
                {isGranted && <Check size={16} className="text-emerald-500" />}
            </div>
            <h4 className="font-bold text-slate-200">{title}</h4>
            <p className="text-xs text-slate-500 mt-1">
                {isGranted ? 'Access Enabled' : isDenied ? 'Access Denied' : 'Click to Enable'}
            </p>
        </button>
    );
};

export default CookieConsent;
