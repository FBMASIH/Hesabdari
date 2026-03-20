import { IconSun, IconMoon } from '@hesabdari/ui';
import type { Theme } from '@/providers/theme-provider';
import { t } from '@/shared/lib/i18n';

const s = t('settings');

export interface ThemeOption {
  key: Theme;
  label: string;
  icon: typeof IconSun | null;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { key: 'light', label: s.lightTheme, icon: IconSun },
  { key: 'dark', label: s.darkTheme, icon: IconMoon },
  { key: 'system', label: s.systemTheme, icon: null },
];
