'use client';

import { useState } from 'react';
import { Button, Input, FormField, FormLabel, cn, IconSun, IconMoon } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { DataPageHeader, FormSection } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useTheme, type Theme } from '@/providers/theme-provider';
import { jalaliCurrentFiscalYear } from '@/shared/lib/date';

const s = t('settings');
const common = t('common');
const msgs = t('messages');

const THEME_OPTIONS: { key: Theme; label: string; icon: typeof IconSun | null }[] = [
  { key: 'light', label: s.lightTheme, icon: IconSun },
  { key: 'dark', label: s.darkTheme, icon: IconMoon },
  { key: 'system', label: s.systemTheme, icon: null },
];

export function SettingsPage() {
  const { showToast } = useAppToast();
  const { theme, setTheme } = useTheme();
  const [orgName, setOrgName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // TODO: wire to API when org settings endpoint exists
      await new Promise((r) => setTimeout(r, 500));
      showToast({ title: msgs.saveSuccess, variant: 'success' });
    } catch {
      showToast({ title: msgs.unexpectedError, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col">
      <DataPageHeader title={s.title} subtitle={s.subtitle} />

      <div className="flex flex-col gap-5 max-w-2xl">
        {/* Organization info */}
        <FormSection title={s.organization}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField>
              <FormLabel>{s.organizationName}</FormLabel>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="rounded-xl"
              />
            </FormField>
            <FormField>
              <FormLabel>{s.fiscalYear}</FormLabel>
              <Input
                value={jalaliCurrentFiscalYear()}
                readOnly
                className="rounded-xl bg-bg-secondary"
              />
            </FormField>
            <FormField>
              <FormLabel>{s.defaultCurrency}</FormLabel>
              <Input
                value={`${common.rial} (IRR)`}
                readOnly
                className="rounded-xl bg-bg-secondary ltr-text"
                dir="ltr"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Theme */}
        <FormSection title={s.theme}>
          <div className="flex flex-wrap gap-3">
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTheme(opt.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary-default bg-primary-subtle text-primary-default'
                      : 'border-border-primary text-fg-secondary hover:text-fg-primary hover:border-fg-tertiary',
                  )}
                >
                  {Icon && (
                    <Icon
                      size={16}
                      className={isActive ? 'text-primary-default' : 'text-fg-tertiary'}
                    />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FormSection>

        {/* Display preferences */}
        <FormSection title={s.language} description={s.displayPreferences}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField>
              <FormLabel>{s.language}</FormLabel>
              <Input value="فارسی" readOnly className="rounded-xl bg-bg-secondary" />
            </FormField>
            <FormField>
              <FormLabel>{s.amountDisplay}</FormLabel>
              <Input value="تومان (ریال ÷ ۱۰)" readOnly className="rounded-xl bg-bg-secondary" />
            </FormField>
          </div>
        </FormSection>

        {/* Save */}
        <div className="flex">
          <Button type="button" onClick={handleSave} disabled={isSaving} className="rounded-xl">
            {isSaving ? common.loading : common.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
