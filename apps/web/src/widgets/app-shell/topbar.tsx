'use client';

import { Button } from '@hesabdari/ui';
import { useTheme } from '@/providers/theme-provider';

export function Topbar() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-primary px-6">
      <div />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? '\u2600' : '\u263E'}
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-fg font-semibold">
          U
        </div>
      </div>
    </header>
  );
}
