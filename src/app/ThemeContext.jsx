import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { createAppTheme, THEME_PRESETS, DEFAULT_THEME_ID, DEFAULT_MODE } from '@/app/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';

const STORAGE_KEY_THEME = 'app-theme-id';
const STORAGE_KEY_MODE = 'app-theme-mode';

const ThemeContext = createContext(null);

export function ThemeSettingsProvider({ children }) {
  const { currentUser } = useAuth();

  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) || DEFAULT_THEME_ID;
  });

  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_MODE);
    if (stored) return stored;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return DEFAULT_MODE;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Before login: always use default theme in light mode (white)
  const activeThemeId = currentUser ? themeId : DEFAULT_THEME_ID;
  const activeMode = currentUser ? mode : 'light';

  const theme = useMemo(() => createAppTheme(activeThemeId, activeMode), [activeThemeId, activeMode]);

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      mode,
      setMode,
      toggleMode,
      theme,
      preset: THEME_PRESETS[themeId] || THEME_PRESETS[DEFAULT_THEME_ID],
    }),
    [themeId, mode, toggleMode, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeSettings must be used within ThemeSettingsProvider');
  return ctx;
}
