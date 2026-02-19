import React, { createContext, useContext } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { lightColors, darkColors } from './colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const isDark = useSettingsStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
