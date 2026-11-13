'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'system' || value === 'light' || value === 'dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const isDark = mode === 'dark' || (mode === 'system' && systemPrefersDark);

  useEffect(() => {
    const storedMode = window.localStorage.getItem('bookstore-theme');
    if (isThemeMode(storedMode)) setMode(storedMode);
    setPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemPreference = () => setSystemPrefersDark(mediaQuery.matches);

    updateSystemPreference();
    mediaQuery.addEventListener('change', updateSystemPreference);
    return () => mediaQuery.removeEventListener('change', updateSystemPreference);
  }, []);

  useEffect(() => {
    if (!preferenceLoaded) return;

    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

    if (mode === 'system') {
      window.localStorage.removeItem('bookstore-theme');
    } else {
      window.localStorage.setItem('bookstore-theme', mode);
    }

    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark, mode, preferenceLoaded]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#a03037',
            colorLink: '#a03037',
            colorSuccess: '#388e3c',
            colorError: '#a03037',
            colorBgBase: isDark ? '#171717' : '#ffffff',
            colorTextBase: isDark ? '#f5f5f5' : '#0a0102',
            borderRadius: 3,
            fontFamily: "'Roboto', system-ui, sans-serif",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
