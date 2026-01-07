import { create } from 'zustand';
import { ProfileWithAcademy } from '@/types/custom';
import { authService } from '@/services/authService';

interface AuthState {
    user: ProfileWithAcademy | null;
    loading: boolean;
    error: string | null;
    checkSession: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,
    error: null,

    checkSession: async () => {
        set({ loading: true });
        try {
            const user = await authService.getCurrentUser();
            set({ user, loading: false });
        } catch (error) {
            console.error('Session check failed', error);
            set({ user: null, loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            await authService.signInWithPassword(email, password);
            // After successful login, fetch the user profile
            await get().checkSession();
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    signOut: async () => {
        await authService.signOut();
        set({ user: null });
    }
}));
