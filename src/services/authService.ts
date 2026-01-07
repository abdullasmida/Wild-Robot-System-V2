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

        console.log('👤 AuthService: Session found, fetching profile...', session.user.id);

        try {
            // Create a timeout promise
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
            );

            // Race query against timeout to prevent endless hanging
            const profile = await Promise.race([
                profileService.getProfileWithAcademy(session.user.id),
                timeout
            ]) as ProfileWithAcademy;

            console.log('✅ AuthService: Profile loaded', profile);
            return profile;
        } catch (error) {
            console.error('❌ AuthService: Error fetching user profile:', error);
            // If profile missing or DB error, return null to force logout/redirect instead of hanging
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
