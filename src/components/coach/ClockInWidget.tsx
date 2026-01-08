import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '../../supabaseClient';
import { format, differenceInMinutes, addMinutes } from 'date-fns';
import { Timer, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ClockInModal from '../modals/ClockInModal';

const ClockInWidget = () => {
    const { user } = useUser();
    const [status, setStatus] = useState<'loading' | 'idle' | 'upcoming' | 'working'>('loading');
    const [currentShift, setCurrentShift] = useState<any>(null);
    const [nextShift, setNextShift] = useState<any>(null);
    const [timeElapsed, setTimeElapsed] = useState<string>('00:00:00');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Poll for Shifts
    const checkShifts = async () => {
        if (!user) return;

        try {
            const now = new Date();
            const nowISO = now.toISOString();

            // A. Check for ACTIVE (Clocked In) Shift
            const { data: activeShifts } = await supabase
                .from('staff_shifts')
                .select('*')
                .eq('staff_id', user.id)
                .not('clock_in_time', 'is', null)
                .is('clock_out_time', null)
                .limit(1);

            if (activeShifts && activeShifts.length > 0) {
                setCurrentShift(activeShifts[0]);
                setStatus('working');
                return;
            }

            // B. Check for NEXT UPCOMING Shift (Today)
            const { data: upcomingShifts } = await supabase
                .from('staff_shifts')
                .select('*')
                .eq('staff_id', user.id)
                .gte('start_time', nowISO)
                .order('start_time', { ascending: true })
                .limit(1);

            if (upcomingShifts && upcomingShifts.length > 0) {
                const shift = upcomingShifts[0];
                const startTime = new Date(shift.start_time);
                const diff = differenceInMinutes(startTime, now);

                setNextShift(shift);

                if (diff <= 30) {
                    setStatus('upcoming'); // Close enough to clock in
                } else {
                    setStatus('idle'); // Too early
                }
            } else {
                setStatus('idle');
                setNextShift(null);
            }

        } catch (error) {
            console.error('Error fetching shifts:', error);
        } finally {
            if (status === 'loading') setStatus('idle');
        }
    };

    useEffect(() => {
        checkShifts();
        const interval = setInterval(checkShifts, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [user]);

    // 2. Timer Logic for "Working"
    useEffect(() => {
        let timer: any;
        if (status === 'working' && currentShift?.clock_in_time) {
            timer = setInterval(() => {
                const start = new Date(currentShift.clock_in_time);
                const now = new Date();
                const diffMs = now.getTime() - start.getTime();

                const hours = Math.floor(diffMs / 3600000);
                const minutes = Math.floor((diffMs % 3600000) / 60000);
                const seconds = Math.floor((diffMs % 60000) / 1000);

                setTimeElapsed(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status, currentShift]);

    // 3. Handlers
    const handleClockIn = async () => {
        if (!nextShift) return;

        try {
            const { error } = await supabase
                .from('staff_shifts')
                .update({
                    clock_in_time: new Date().toISOString(),
                    status: 'in_progress'
                })
                .eq('id', nextShift.id);

            if (error) throw error;

            toast.success('Clocked In Successfully!');
            setStatus('working');
            setCurrentShift({ ...nextShift, clock_in_time: new Date().toISOString() });
            setNextShift(null);
            setIsModalOpen(false);

        } catch (err) {
            toast.error('Failed to Clock In');
            console.error(err);
        }
    };

    const handleClockOut = async () => {
        if (!currentShift) return;

        try {
            const { error } = await supabase
                .from('staff_shifts')
                .update({
                    clock_out_time: new Date().toISOString(),
                    status: 'completed'
                })
                .eq('id', currentShift.id);

            if (error) throw error;

            toast.success('Clocked Out. Good job!');
            setStatus('idle');
            setCurrentShift(null);
            checkShifts();

        } catch (err) {
            toast.error('Failed to Clock Out');
            console.error(err);
        }
    };

    // 4. Render
    if (status === 'working') {
        return (
            <button
                onClick={handleClockOut}
                className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition-all animate-in fade-in"
            >
                <div className="relative">
                    <Timer className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-bold uppercase opacity-80 leading-none">On the Clock</p>
                    <p className="text-sm font-mono font-bold leading-none mt-0.5">{timeElapsed}</p>
                </div>
            </button>
        );
    }

    if (status === 'upcoming') {
        return (
            <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg shadow-emerald-500/30 transition-all animate-pulse"
                >
                    <MapPin className="w-5 h-5" />
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase opacity-80 leading-none">Next: Start Now</p>
                        <p className="text-xs font-bold leading-none mt-0.5 pointer-events-none">
                            {nextShift?.title || 'Class Session'}
                        </p>
                    </div>
                </button>
                <ClockInModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleClockIn}
                    shiftTitle={nextShift?.title}
                />
            </>
        );
    }

    if (status === 'idle' && nextShift) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-500 border border-slate-200">
                <Clock className="w-4 h-4" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Up Next</span>
                    <span className="text-xs font-bold text-slate-700 leading-none mt-0.5">
                        {format(new Date(nextShift.start_time), 'h:mm a')}
                    </span>
                </div>
            </div>
        );
    }

    return null;
};

export default ClockInWidget;
