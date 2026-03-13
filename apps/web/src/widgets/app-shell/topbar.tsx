'use client';

import { Button } from '@hesabdari/ui';
import { useTheme } from '@/providers/theme-provider';
import { t } from '@/shared/lib/i18n';

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
          aria-label={t('settings').toggleTheme}
        >
          {resolvedTheme === 'dark' ? '\u2600' : '\u263E'}
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-fg">
          U
        </div>
      </div>
    </header>
  );
}
