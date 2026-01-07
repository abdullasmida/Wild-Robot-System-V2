import { supabase } from '@/lib/supabase';
import { Profile, ProfileWithAcademy } from '@/types/custom';

export const profileService = {
    /**
     * Get a profile by ID
     */
    async getProfile(id: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get profile with Academy details (Join Strategy)
     */
    async getProfileWithAcademy(id: string): Promise<ProfileWithAcademy | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, academy:academies(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        // Supabase returns joined data as a nested object, casting it to our custom type
        return data as unknown as ProfileWithAcademy;
    },

    /**
     * Update profile
     */
    async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
