import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGameStatusStore = create(
  persist(
    (set) => ({
      currentRound: 1,
      anyGameEverStarted: false,
      gameInProgress: false,
      isBoardShown: false,
      currentGameTime: 0,
      totalGameTime: 0,

      setCurrentRound: (round) => set({ currentRound: round }),
      setAnyGameEverStarted: (value) => set({ anyGameEverStarted: value }),
      setGameInProgress: (value) => set({ gameInProgress: value }),
      setIsBoardShown: (value) => set({ isBoardShown: value }),
      setCurrentGameTime: (time) => set({ currentGameTime: time }),
      setTotalGameTime: (time) => set({ totalGameTime: time }),
      resetGame: () =>
        set({
          currentRound: 1,
          anyGameEverStarted: false,
          gameInProgress: false,
          isBoardShown: false,
          currentGameTime: 0,
          totalGameTime: 0,
        }),
    }),
    {
      name: 'game-status-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
