import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSettingsStore = create(
  persist(
    (set) => ({
      isDark: false,
      dontShowLoginPromptAgain: false,
      lastProgressOwner: null,
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
      setDontShowLoginPromptAgain: (value) =>
        set({ dontShowLoginPromptAgain: value }),
      setLastProgressOwner: (value) => set({ lastProgressOwner: value }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
