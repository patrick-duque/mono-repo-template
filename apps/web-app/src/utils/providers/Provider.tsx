import { type FC, type PropsWithChildren, useEffect } from 'react';

import { create } from 'zustand';

import { THEME_STORAGE_KEY } from 'utils/constants';
import { getAccessTokenCookie } from 'utils/helpers';

type ThemeMode = 'light' | 'dark';

interface ProviderState {
  isAuthenticated: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

const DEFAULT_THEME: ThemeMode = 'light';

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === 'light' || value === 'dark';
};

const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  try {
    const theme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isThemeMode(theme) ? theme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const saveTheme = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures so theme switching still works for the current session.
  }
};

const useProvider = create<ProviderState>((set) => ({
  isAuthenticated: Boolean(getAccessTokenCookie()),
  setAuthenticated: (isAuthenticated: boolean) => {
    set({ isAuthenticated });
  },
  setTheme: (theme: ThemeMode) => {
    set({ theme });
  },
  theme: getStoredTheme(),
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    }));
  },
}));

const Provider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useProvider((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    saveTheme(theme);
  }, [theme]);

  return children;
};

// eslint-disable-next-line react-refresh/only-export-components
export { useProvider, type ProviderState, type ThemeMode };

export default Provider;
