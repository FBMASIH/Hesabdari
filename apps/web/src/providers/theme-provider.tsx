'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Read the initial theme state from what ThemeScript already set on <html>.
 * This prevents a one-frame flicker where React resets data-theme to 'light'
 * before the first useEffect fires.
 */
function getInitialState(): { theme: Theme; resolved: 'light' | 'dark' } {
  if (typeof window === 'undefined') {
    return { theme: 'system', resolved: 'light' };
  }

  const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system';
  const preSet = document.documentElement.getAttribute('data-theme');
  const resolved = preSet === 'dark' ? 'dark' : 'light';

  return { theme: stored, resolved };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(getInitialState);
  const [theme, setTheme] = useState<Theme>(initial.theme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(initial.resolved);

  useEffect(() => {
    const resolve = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const resolved = resolve();
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
