import { useSettingsStore } from '../settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      isDark: false,
      dontShowLoginPromptAgain: false,
    });
  });

  it('toggles theme', () => {
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().isDark).toBe(true);

    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().isDark).toBe(false);
  });

  it('persists login prompt dismissal flag in state', () => {
    useSettingsStore.getState().setDontShowLoginPromptAgain(true);
    expect(useSettingsStore.getState().dontShowLoginPromptAgain).toBe(true);
  });
});
