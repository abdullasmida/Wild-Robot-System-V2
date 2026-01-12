import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, MapPin, MoreHorizontal, User, CheckCircle, MessageCircle, Shield, AlertCircle, ChevronDown, ChevronRight, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface SessionDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    session: any | null;
}

export default function SessionDetailsDrawer({ isOpen, onClose, session }: SessionDetailsDrawerProps) {
    const [activeTab, setActiveTab] = useState<'register' | 'trials' | 'waitlist' | 'attendance'>('register');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && session) {
            // In a real app, we would fetch here. For this demo, we generate High-Fi mocks immediately.
            setStudents(generateMockStudents());
        }
    }, [isOpen, session]);

    const generateMockStudents = () => {
        return [
            { id: '1', name: 'Leo Smith', age: '5y 3m', status: 'active', payment: 'paid', medical: 'Peanut Allergy', photo: null },
            { id: '2', name: 'Maya Jones', age: '6y 1m', status: 'active', payment: 'due', medical: null, photo: null },
            { id: '3', name: 'Sam Doe', age: '5y 8m', status: 'trial', payment: 'trial', medical: null, photo: null },
            { id: '4', name: 'Zara Chen', age: '5y 11m', status: 'active', payment: 'paid', medical: 'Asthma (Inhaler in bag)', photo: null },
            { id: '5', name: 'Kai Kim', age: '6y 0m', status: 'waitlist', payment: 'n/a', medical: null, photo: null },
        ];
    };

    if (!session) return null;

    // Derived Data
    const startTime = new Date(session.start_time);
    const capacity = session.batch?.capacity || 15;
    const enrolledCount = students.filter(s => s.status === 'active' || s.status === 'trial').length;

    // UI Helpers
    const toggleExpand = (id: string) => {
        setExpandedStudentId(expandedStudentId === id ? null : id);
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col bg-white shadow-2xl">

                                        {/* 1. HEADER (Context) */}
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(startTime, 'EEEE, MMM d')} • {format(startTime, 'h:mm a')}
                                                    </span>
                                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                                        {session.batch?.name}
                                                    </h2>
                                                </div>
                                                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>

                                            {/* Meta Badges */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {session.batch?.location?.name || 'Main Hall'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    {session.coach?.first_name || 'Coach'}
                                                </div>
                                                {/* Profit Badge */}
                                                <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Profitable
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. TABS */}
                                        <div className="border-b border-slate-200 px-6">
                                            <div className="flex gap-6">
                                                {['register', 'trials', 'waitlist', 'attendance'].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tab as any)}
                                                        className={`
                                                            py-3 text-sm font-semibold border-b-2 transition-all capitalize
                                                            ${activeTab === tab
                                                                ? 'border-indigo-600 text-indigo-600'
                                                                : 'border-transparent text-slate-500 hover:text-slate-800'}
                                                        `}
                                                    >
                                                        {tab}
                                                        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {tab === 'register' ? enrolledCount : tab === 'trials' ? 1 : 0}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. STUDENT LIST */}
                                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                                            <div className="space-y-3">
                                                {students.map((student) => (
                                                    <div
                                                        key={student.id}
                                                        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                                    >
                                                        {/* Main Row */}
                                                        <div
                                                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => toggleExpand(student.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {/* Avatar */}
                                                                <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                                    <User className="w-5 h-5" />
                                                                </div>

                                                                {/* Info */}
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                                                        {student.medical && <Shield className="w-3 h-3 text-rose-500" />}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 font-medium">{student.age}</div>
                                                                </div>
                                                            </div>

                                                            {/* Right Side */}
                                                            <div className="flex items-center gap-3">
                                                                {student.payment === 'paid' && (
                                                                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-wide">Paid</span>
                                                                )}
                                                                {student.payment === 'due' && (
                                                                    <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100 uppercase tracking-wide">Due</span>
                                                                )}
                                                                {student.payment === 'trial' && (
                                                                    <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 uppercase tracking-wide">Trial</span>
                                                                )}

                                                                {expandedStudentId === student.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                            </div>
                                                        </div>

                                                        {/* Expanded Details */}
                                                        {expandedStudentId === student.id && (
                                                            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 grid gap-2">
                                                                {student.medical && (
                                                                    <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
                                                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                                        <p className="text-xs font-medium">Medical Alert: {student.medical}</p>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                                                    <span>Parent: Sarah Smith</span>
                                                                    <button className="text-indigo-600 font-bold hover:underline">View Profile</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 4. FOOTER (Actions) */}
                                        <div className="p-4 border-t border-slate-200 bg-white grid gap-3 sticky bottom-0 z-10">
                                            <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                Mark Attendance
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors">
                                                    <MessageCircle className="w-4 h-4 text-green-500" />
                                                    Message Group
                                                </button>
                                                <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors">
                                                    <Banknote className="w-4 h-4 text-slate-500" />
                                                    Manage Fees
                                                </button>
                                            </div>
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
