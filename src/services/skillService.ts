import { supabase } from '@/lib/supabase';
import { SkillWithRelations, PlayerEvaluation, SkillWithStatus } from '@/types/custom';

export const skillService = {
    /**
     * Fetch all skills for a specific level, including apparatus info
     */
    async getSkillsByLevel(levelId: string): Promise<SkillWithRelations[]> {
        const { data, error } = await supabase
            .from('skills')
            .select('*, apparatus:apparatus (id, name, icon_url)')
            .eq('level_id', levelId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data as unknown as SkillWithRelations[];
    },

    /**
     * Fetch player's progress (evaluations)
     */
    async getPlayerProgress(playerId: string): Promise<PlayerEvaluation[]> {
        const { data, error } = await supabase
            .from('player_evaluations')
            .select('*')
            .eq('player_id', playerId);

        if (error) throw error;
        return data as PlayerEvaluation[];
    },

    /**
     * Merge skills with player progress to determine status/stars
     */
    mergeSkillsWithProgress(skills: SkillWithRelations[], evaluations: PlayerEvaluation[]): SkillWithStatus[] {
        const evalMap = new Map(evaluations.map(e => [e.skill_id, e]));

        return skills.map(skill => {
            const evaluation = evalMap.get(skill.id);
            return {
                ...skill,
                status: evaluation?.status || 'locked', // Default to locked or unlocked based on logic
                stars: (evaluation?.stars as 0 | 1 | 2 | 3) || 0,
                feedback: undefined // Or fetch relations
            };
        });
    }
};
