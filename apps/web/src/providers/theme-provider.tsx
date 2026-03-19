'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

function isTheme(value: string): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

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

  let raw: string | null = null;
  try {
    raw = localStorage.getItem('theme');
  } catch {
    /* storage unavailable */
  }
  const stored: Theme = raw && isTheme(raw) ? raw : 'system';
  const preSet = document.documentElement.getAttribute('data-theme');
  const resolved = preSet === 'dark' ? 'dark' : 'light';

  return { theme: stored, resolved };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(getInitialState);
  const [theme, setTheme] = useState<Theme>(initial.theme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(initial.resolved);

  useEffect((): (() => void) | void => {
    const resolve = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const resolved = resolve();
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage unavailable */
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (theme === 'system') {
      const listener = () => {
        const r = mq.matches ? 'dark' : 'light';
        setResolvedTheme(r);
        document.documentElement.setAttribute('data-theme', r);
      };
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
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
