export interface Curriculum {
    id: string;
    academy_id: string;
    name: string;
    version: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Skill {
    id: string;
    academy_id?: string; // Nullable for global skills
    curriculum_id?: string;
    apparatus_id?: string;
    level_id?: string;
    name: string;
    description?: string;
    video_provider_id?: string;
    video_platform?: 'youtube' | 'vimeo' | 'custom';
    preview_url?: string;
    video_url?: string; // Legacy
    created_at: string;
}

export interface Drill {
    id: string;
    academy_id: string;
    title: string;
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    video_provider_id?: string;
    video_platform?: 'youtube' | 'vimeo' | 'custom';
    preview_url?: string;
    created_at: string;
}

export interface DrillSkill {
    drill_id: string;
    skill_id: string;
}

export interface WorkoutPlan {
    id: string;
    academy_id: string;
    author_id?: string;
    assigned_level_id?: string;
    title: string;
    description?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkoutItem {
    id: string;
    plan_id: string;
    drill_id?: string;
    skill_id?: string;
    sort_order: number;
    duration_minutes?: number;
    notes?: string;
}
