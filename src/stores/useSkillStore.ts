import { create } from 'zustand';
import { skillService } from '@/services/skillService';
import { SkillWithStatus } from '@/types/custom';

interface SkillState {
    currentLevelId: string | null;
    skills: SkillWithStatus[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchLevelSkills: (levelId: string, playerId: string) => Promise<void>;
    setCurrentLevel: (levelId: string) => void;
}

export const useSkillStore = create<SkillState>((set) => ({
    currentLevelId: null,
    skills: [],
    loading: false,
    error: null,

    setCurrentLevel: (levelId) => set({ currentLevelId: levelId }),

    fetchLevelSkills: async (levelId, playerId) => {
        set({ loading: true, error: null, currentLevelId: levelId });
        try {
            // Parallel fetch for performance
            const [skillsRaw, progress] = await Promise.all([
                skillService.getSkillsByLevel(levelId),
                skillService.getPlayerProgress(playerId)
            ]);

            const mergedSkills = skillService.mergeSkillsWithProgress(skillsRaw, progress);

            set({ skills: mergedSkills, loading: false });
        } catch (error: any) {
            console.error('Failed to fetch skill tree:', error);
            set({ error: error.message || 'Failed to load skills', loading: false });
        }
    }
}));
