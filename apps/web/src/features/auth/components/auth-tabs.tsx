import { cn } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import type { AuthMode } from './auth-form';

interface AuthTabsProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const TAB_BASE = 'flex-1 rounded-full text-[13px] font-semibold transition-all duration-200';
const TAB_ACTIVE = 'bg-brand-deep text-primary-fg shadow-sm';
const TAB_INACTIVE = 'text-fg-secondary hover:text-fg-primary';

/** macOS-style segmented control for sign-in / sign-up toggle */
export function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  const auth = t('auth');

  return (
    <div
      role="tablist"
      aria-label={auth.authModeLabel}
      className="flex h-[38px] rounded-full bg-bg-tertiary p-[3px]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'sign-in'}
        className={cn(TAB_BASE, mode === 'sign-in' ? TAB_ACTIVE : TAB_INACTIVE)}
        onClick={() => onModeChange('sign-in')}
      >
        {auth.signIn}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'sign-up'}
        className={cn(TAB_BASE, mode === 'sign-up' ? TAB_ACTIVE : TAB_INACTIVE)}
        onClick={() => onModeChange('sign-up')}
      >
        {auth.signUp}
      </button>
    </div>
  );
}
