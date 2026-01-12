import React from 'react';
import { BadgeCheck, PlayCircle, Trophy, Dumbbell } from 'lucide-react';
import { VideoPlayer } from '../media/VideoPlayer';
// import { Skill } from '../../types/training'; // Ideally import type

// Mock type for now to avoid compilation errors if types file isn't perfect yet
interface Skill {
    id: string;
    name: string;
    description?: string;
    video_provider_id?: string;
    video_platform?: 'youtube' | 'vimeo' | 'custom';
    preview_url?: string;
    video_url?: string;
    apparatus?: { name: string; icon_url?: string };
    level?: { name: string; order: number };
}

interface SkillCardProps {
    skill: Skill;
    onEdit?: (skill: Skill) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onEdit }) => {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col gap-3 group relative">

            {/* Video Section */}
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-50 relative">
                <VideoPlayer
                    platform={skill.video_platform}
                    providerId={skill.video_provider_id}
                    url={skill.video_url}
                    previewUrl={skill.preview_url}
                    className="w-full h-full"
                />

                {/* Level Badge Overlay */}
                {skill.level && (
                    <div className="absolute top-2 left-2 flex gap-1">
                        <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            {skill.level.name}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {skill.apparatus && (
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <Dumbbell className="w-3 h-3" /> {skill.apparatus.name}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {skill.name}
                        </h3>
                    </div>

                    {/* Edit Action (Hidden until hover) */}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(skill)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900"
                        >
                            <BadgeCheck className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {skill.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {skill.description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SkillCard;
