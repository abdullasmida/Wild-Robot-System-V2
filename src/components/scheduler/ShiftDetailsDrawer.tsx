import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, MapPin, Clock, Users, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import UserAvatar from '@/components/ui/UserAvatar';

interface ShiftDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    session: any; // Using any for speed, strictly define interface later
    onActionComplete?: () => void;
}

export default function ShiftDetailsDrawer({ isOpen, onClose, session, onActionComplete }: ShiftDetailsDrawerProps) {
    const { user } = useUser();

    if (!session) return null;

    const isAssigned = session.assignments?.some((a: any) => a.staff_id === user?.id);
    const isOpenShift = session.is_open_for_claim && !isAssigned;

    // Calculate if full?
    const currentCount = session.assignments?.length || 0;
    const capacity = session.capacity || 1;
    const isFull = currentCount >= capacity;

    const handleClaimShift = async () => {
        try {
            const { error } = await supabase.from('session_assignments').insert({
                session_id: session.id,
                staff_id: user?.id,
                status: 'confirmed' // Auto-confirm for now, or 'pending' if approval needed
            });

            if (error) throw error;
            toast.success("Shift Claimed! 🚀", { description: "You have been added to this shift." });
            onActionComplete?.();
            onClose();
        } catch (e: any) {
            toast.error("Failed to claim shift", { description: e.message });
        }
    };

    const startTime = parseISO(session.start_time);
    const endTime = parseISO(session.end_time);

    // Color logic
    const themeColor = session.color || session.locations?.color || '#10B981';

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">

                                        {/* HEADER (Colored) */}
                                        <div
                                            className="px-6 py-6 sm:px-8 relative"
                                            style={{ backgroundColor: `${themeColor}15` }} // 15% opacity tint
                                        >
                                            <button
                                                type="button"
                                                className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/50 hover:text-slate-600 focus:outline-none transition-colors"
                                                onClick={onClose}
                                            >
                                                <X className="h-5 w-5" aria-hidden="true" />
                                            </button>

                                            <div className="flex items-center gap-2 mb-3">
                                                <span
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset uppercase tracking-wider bg-white"
                                                    style={{ color: themeColor, ringColor: `${themeColor}40` }}
                                                >
                                                    {session.job_type || 'Shift'}
                                                </span>
                                                {isOpenShift && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                                                        <ShieldCheck className="w-3 h-3" /> Open
                                                    </span>
                                                )}
                                            </div>

                                            <Dialog.Title className="text-2xl font-black text-slate-900 leading-tight">
                                                {session.title}
                                            </Dialog.Title>

                                            <div className="mt-4 flex items-center gap-2 text-slate-700 font-bold">
                                                <Clock className="w-5 h-5 text-slate-400" />
                                                <span>
                                                    {format(startTime, 'EEEE, MMM do')} • {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* CONTENT BODY */}
                                        <div className="relative flex-1 px-6 py-6 sm:px-8 space-y-8">

                                            {/* 1. LOCATION & MAP */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-slate-400" /> Location
                                                    </h3>
                                                    <span className="text-xs text-slate-500 font-medium">{session.locations?.name}</span>
                                                </div>

                                                {/* Map Preview (Static Fallback) */}
                                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex flex-col items-center justify-center relative group isolate">
                                                    {/* Background Pattern */}
                                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />

                                                    {session.locations?.address ? (
                                                        <>
                                                            <div className="z-10 bg-white p-3 rounded-full shadow-lg mb-3 ring-4 ring-slate-100 group-hover:scale-110 transition-transform duration-300">
                                                                <MapPin className="w-6 h-6 text-red-500" />
                                                            </div>
                                                            <div className="z-10 text-center px-6">
                                                                <p className="text-sm font-bold text-slate-900 mb-1">
                                                                    {session.locations.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500 line-clamp-1">
                                                                    {session.locations.address}
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.locations.address)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                            >
                                                                <span className="bg-white/90 text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                                    Open in Google Maps ↗
                                                                </span>
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <div className="z-10 flex flex-col items-center text-slate-400">
                                                            <MapPin className="w-8 h-8 mb-2 opacity-50" />
                                                            <span className="text-xs font-medium">No Address Provided</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 pl-1">{session.locations?.address}</p>
                                            </div>

                                            {/* 2. THE CREW */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" /> The Crew
                                                </h3>
                                                {session.assignments && session.assignments.length > 0 ? (
                                                    <div className="flex flex-col gap-3">
                                                        {session.assignments.map((assignment: any) => (
                                                            <div key={assignment.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8">
                                                                        <UserAvatar user={assignment.staff} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900">
                                                                            {assignment.staff?.first_name} {assignment.staff?.last_name}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                                                                            {assignment.role || 'Staff'} {assignment.staff_id === user?.id && '(You)'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className={`w-2 h-2 rounded-full ${assignment.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                                                        No staff assigned yet.
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3. NOTES */}
                                            {session.notes && (
                                                <div className="space-y-2">
                                                    <h3 className="text-sm font-bold text-slate-900">Notes</h3>
                                                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm leading-relaxed">
                                                        {session.notes}
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        {/* FOOTER ACTIONS */}
                                        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 pb-8 sm:px-8">
                                            {isAssigned ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-3 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-200 transition-all"
                                                        onClick={() => toast.info("Swap Request feature coming soon!")}
                                                    >
                                                        Request Swap
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95"
                                                        onClick={() => {
                                                            toast.success("Clocked In! ⏱️");
                                                            onClose();
                                                        }}
                                                    >
                                                        Clock In <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : isOpenShift ? (
                                                <button
                                                    type="button"
                                                    onClick={handleClaimShift}
                                                    disabled={isFull}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                                >
                                                    {isFull ? 'Shift Full' : 'Claim This Shift ✋'}
                                                </button>
                                            ) : (
                                                <div className="text-center text-slate-400 text-sm font-bold">
                                                    Read Only Mode
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
