import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'business' | 'floor';

interface AppState {
    viewMode: ViewMode;
    toggleViewMode: () => void;
    setViewMode: (mode: ViewMode) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            viewMode: 'business',
            toggleViewMode: () => set((state) => ({
                viewMode: state.viewMode === 'business' ? 'floor' : 'business'
            })),
            setViewMode: (mode) => set({ viewMode: mode }),
        }),
        {
            name: 'wild-robot-app-storage',
        }
    )
);
