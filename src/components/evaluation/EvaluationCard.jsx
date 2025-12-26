import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { generateCertificate } from '../../utils/pdfUtils';

export default function EvaluationCard({
    student,
    levelData,
    isPresent = true,
    onToggleAttendance,
    trainingPlan = [],
    onUpdatePlan
}) {
    // --- State ---
    const [skills, setSkills] = useState(levelData || []);
    const [expanded, setExpanded] = useState(null);

    // Sync State
    useEffect(() => {
        if (levelData) {
            setSkills(levelData);
            if (levelData.length === 1) setExpanded(levelData[0].name);
        }
    }, [levelData]);

    // --- Logic ---
    const calculateTotalScore = () => {
        let totalStars = 0;
        let maxStars = 0;
        skills.forEach(category => {
            category.skills.forEach(skill => {
                totalStars += skill.rating;
                maxStars += 5;
            });
        });
        return { totalStars, maxStars, percent: maxStars > 0 ? (totalStars / maxStars) * 100 : 0 };
    };

    const { percent } = calculateTotalScore();
    const isCertificateReady = percent >= 90;

    // --- Handlers ---
    const handleRate = (categoryName, skillId, rating) => {
        // 1. Update Local Skill State
        setSkills(prev => prev.map(cat =>
            cat.name === categoryName
                ? { ...cat, skills: cat.skills.map(s => s.id === skillId ? { ...s, rating } : s) }
                : cat
        ));

        // 2. Smart Suggestion Logic (The Polish)
        // If rating is low (1-2 stars), suggest relevant focus area
        if (rating <= 2 && onUpdatePlan) {
            let suggestion = null;
            // Simple keyword matching for demo
            if (categoryName === 'Floor' || categoryName === 'Beam') suggestion = 'Flexibility';
            if (categoryName === 'Bars' || categoryName === 'Strength') suggestion = 'Strength';
            if (categoryName === 'Vault') suggestion = 'Vault Tech';

            if (suggestion && !trainingPlan.includes(suggestion)) {
                onUpdatePlan([...trainingPlan, suggestion]);
            }
        }
    };

    const handleNote = (categoryName, skillId, note) => {
        setSkills(prev => prev.map(cat =>
            cat.name === categoryName
                ? { ...cat, skills: cat.skills.map(s => s.id === skillId ? { ...s, note } : s) }
                : cat
        ));
    };

    const togglePlanChip = (chip) => {
        if (!onUpdatePlan) return;
        if (trainingPlan.includes(chip)) {
            onUpdatePlan(trainingPlan.filter(c => c !== chip));
        } else {
            onUpdatePlan([...trainingPlan, chip]);
        }
    };

    const PLAN_OPTIONS = ['Strength', 'Flexibility', 'Vault Tech', 'Bar Drills', 'Core', 'Rest/Recovery'];

    return (
        <div className={clsx(
            "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300",
            isPresent ? "border-slate-200" : "border-slate-100 opacity-90"
        )}>
            {/* ----------------------------------------------------------------------
                ROW 1: THE GATE (Attendance)
            ---------------------------------------------------------------------- */}
            <div className={clsx(
                "p-4 border-b flex justify-between items-center transition-colors px-6",
                isPresent ? "bg-slate-50/50 border-slate-100" : "bg-red-50/50 border-red-100"
            )}>
                <div className="flex items-center gap-4">
                    {/* Status Dot + Avatar */}
                    <div className="relative">
                        <div className={clsx(
                            "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors border-2",
                            isPresent ? "bg-slate-200 text-slate-500 border-white" : "bg-slate-100 text-slate-300 border-transparent"
                        )}>
                            {student.name.charAt(0)}
                        </div>
                        <div className={clsx(
                            "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center transition-all shadow-sm",
                            isPresent ? "bg-emerald-500" : "bg-slate-300"
                        )}>
                            <span className="material-symbols-outlined text-[12px] text-white font-bold">
                                {isPresent ? 'check' : 'close'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className={clsx("text-lg font-black transition-colors", isPresent ? "text-slate-900" : "text-slate-400 line-through")}>
                            {student.name}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase">{student.level} • Age {student.age}</p>
                    </div>
                </div>

                {/* Status Toggle */}
                <button
                    onClick={onToggleAttendance}
                    className={clsx(
                        "px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm border",
                        isPresent
                            ? "bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                            : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                    )}
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {isPresent ? 'check_circle' : 'cancel'}
                    </span>
                    {isPresent ? 'Present' : 'Absent'}
                </button>
            </div>

            {/* ----------------------------------------------------------------------
                ROW 2: THE PERFORMANCE (Skill Assessment)
                Note: Disabled/Hidden if Absent
            ---------------------------------------------------------------------- */}
            <div className={clsx(
                "transition-all duration-500 ease-in-out",
                isPresent ? "opacity-100" : "opacity-40 grayscale pointer-events-none select-none filter blur-[1px]"
            )}>
                {/* Certificate Banner (Visual Reward) */}
                {isCertificateReady && isPresent && (
                    <div className="bg-amber-50 px-6 py-2 border-b border-amber-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                            Ready for Promotion
                        </div>
                        <button onClick={() => generateCertificate(student)} className="text-amber-600 hover:text-amber-800 underline text-xs font-bold">
                            Issue Certificate
                        </button>
                    </div>
                )}

                {/* Progress Bar Header */}
                <div className="px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className={clsx("h-full rounded-full transition-all duration-500",
                                    percent >= 90 ? "bg-amber-400" : "bg-emerald-500"
                                )}
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-400 min-w-[30px] text-right">{Math.round(percent)}%</span>
                    </div>
                </div>

                {/* Accordions */}
                <div className="divide-y divide-slate-100">
                    {skills.map(category => (
                        <div key={category.name} className="bg-white">
                            <button
                                onClick={() => setExpanded(expanded === category.name ? null : category.name)}
                                className="w-full text-left p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                            >
                                <span className="font-bold text-slate-700 group-hover:text-emerald-700">{category.name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-0.5 opacity-50">
                                        {[1, 2, 3].map(i => <span key={i} className="text-[10px] text-slate-300">★</span>)}
                                    </div>
                                    <span className={clsx("material-symbols-outlined text-slate-400 transition-transform",
                                        expanded === category.name && "rotate-180"
                                    )}>expand_more</span>
                                </div>
                            </button>

                            <AnimatePresence>
                                {expanded === category.name && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-slate-50/50 shadow-inner"
                                    >
                                        <div className="p-4 px-6 space-y-4">
                                            {category.skills.length === 0 ? (
                                                <p className="text-slate-400 text-sm italic">No skills in this category.</p>
                                            ) : (
                                                category.skills.map(skill => (
                                                    <div key={skill.id} className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                                            <span className="font-bold text-slate-700 text-sm">{skill.name}</span>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <button
                                                                        key={star}
                                                                        onClick={() => handleRate(category.name, skill.id, star)}
                                                                        className={clsx("text-2xl transition-transform hover:scale-110 focus:outline-none",
                                                                            star <= skill.rating ? "text-amber-400 drop-shadow-sm" : "text-slate-200 hover:text-amber-200"
                                                                        )}
                                                                    >
                                                                        ★
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder="Coach Note..."
                                                                value={skill.note}
                                                                onChange={(e) => handleNote(category.name, skill.id, e.target.value)}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                                                            />
                                                            <span className="material-symbols-outlined absolute right-2 top-2 text-slate-300 text-[16px]">edit_note</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* ----------------------------------------------------------------------
                ROW 3: THE TRAINING PLAN (Assignment)
                Note: Also Hidden if Absent
            ---------------------------------------------------------------------- */}
            {isPresent && (
                <div className="bg-slate-50 border-t border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-emerald-600">fitness_center</span>
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Plan for Next Session</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {PLAN_OPTIONS.map(plan => {
                            const isActive = trainingPlan.includes(plan);
                            return (
                                <button
                                    key={plan}
                                    onClick={() => togglePlanChip(plan)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5",
                                        isActive
                                            ? "bg-slate-800 text-white border-slate-800 shadow-md transform scale-105"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-100"
                                    )}
                                >
                                    {isActive && <span className="material-symbols-outlined text-[10px]">check</span>}
                                    {plan}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
