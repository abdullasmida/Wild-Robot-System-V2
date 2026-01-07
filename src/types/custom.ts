import { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Academy = Database['public']['Tables']['academies']['Row'];

export interface ProfileWithAcademy extends Profile {
    academy?: Academy;
}

export type UserRole = Profile['role'];

// --- Gamification & Skills Types ---

// Assuming these tables exist based on schema description, even if not in supabase.ts yet
// We define them here roughly to unblock development

export interface Skill {
    id: string;
    name: string;
    description: string;
    level_id: string;
    apparatus_id: string;
    video_url?: string;
    points: number;
    order_index: number;
}

export interface Apparatus {
    id: string;
    name: string;
    icon_url?: string;
}

export interface SkillWithRelations extends Skill {
    apparatus?: Apparatus;
}

export type SkillStatus = 'locked' | 'unlocked' | 'in_progress' | 'mastered';

export interface SkillWithStatus extends SkillWithRelations {
    status: SkillStatus;
    stars: 0 | 1 | 2 | 3; // 0 = not started, 3 = mastered
    feedback?: string;
}

export interface PlayerEvaluation {
    id: string;
    player_id: string;
    skill_id: string;
    status: SkillStatus;
    stars: number;
    coach_id?: string;
    updated_at: string;
}
