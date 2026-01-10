import { supabase } from '@/lib/supabase';
import { profileService } from './profileService';
import { ProfileWithAcademy } from '@/types/custom';

export const authService = {
    /**
     * Get the current session user and their profile with academy
     */
    async getCurrentUser(): Promise<ProfileWithAcademy | null> {
        console.log('🔐 AuthService: Check Session Start');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('❌ AuthService: Session Error', sessionError);
            throw sessionError;
        }

        if (!session?.user) {
            console.warn('⚠️ AuthService: No active session');
            return null;
        }

        // Direct robust fetch with explicit Academy join
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, academy:academies(id, name, logo_url)')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('❌ AuthService: Profile Fetch Error', error);
                return null;
            }

            console.log('🔐 AuthService: Fetched Profile:', {
                id: data.id,
                role: data.role,
                academy: data.academy,
                academy_id: data.academy_id
            });

            return data as ProfileWithAcademy;
        } catch (err) {
            console.error('❌ AuthService: Unexpected Error', err);
            return null;
        }
    },

    /**
     * Sign in with email and password
     */
    async signInWithPassword(email: string, password: string): Promise<void> {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    },

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};
