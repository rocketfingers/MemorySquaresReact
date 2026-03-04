import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { useSettingsStore } from '../../stores/settingsStore';

function ThemeProbe() {
  const { isDark, colors } = useTheme();
  return <Text>{`${isDark ? 'dark' : 'light'}-${colors.primary}`}</Text>;
}

describe('ThemeContext', () => {
  it('provides light palette when isDark is false', () => {
    useSettingsStore.setState({ isDark: false });

    const { getByText } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(getByText('light-#6366f1')).toBeTruthy();
  });

  it('provides dark palette when isDark is true', () => {
    useSettingsStore.setState({ isDark: true });

    const { getByText } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(getByText('dark-#818cf8')).toBeTruthy();
  });
});
