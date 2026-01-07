import React, { useState } from 'react';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';

const ClockInModal = ({ isOpen, onClose, onConfirm, shiftTitle }) => {
    const [step, setStep] = useState('confirm'); // confirm, verifying, success

    const handleConfirm = () => {
        setStep('verifying');
        // Simulate Geolocation Check
        setTimeout(() => {
            onConfirm(); // Perform the actual clock in
            onClose(); // In real app, maybe show success state first
            setStep('confirm');
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                {step === 'confirm' && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Confirm Location</h3>
                        <p className="text-slate-500 text-sm">
                            You are about to start <strong>{shiftTitle || 'your shift'}</strong>. We need to verify you are at the academy.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                Verify & Start
                            </button>
                        </div>
                    </div>
                )}

                {step === 'verifying' && (
                    <div className="text-center py-8 space-y-4">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                        <p className="font-bold text-slate-700 animate-pulse">Verifying Geofence...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClockInModal;
