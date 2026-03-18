'use client';

import { useState } from 'react';
import { Button, Input, FormField, FormLabel, cn } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { DataPageHeader, FormSection } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useTheme } from '@/providers/theme-provider';
import { jalaliCurrentFiscalYear } from '@/shared/lib/date';

const s = t('settings');
const common = t('common');
const msgs = t('messages');

export function SettingsPage() {
  const { showToast } = useAppToast();
  const { theme, setTheme } = useTheme();
  const [orgName, setOrgName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      // TODO: wire to API when org settings endpoint exists
      await new Promise((r) => setTimeout(r, 500));
      showToast({ title: msgs.saveSuccess, variant: 'success' });
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
          <div className="flex gap-3">
            {([
              { key: 'light' as const, label: s.lightTheme },
              { key: 'dark' as const, label: s.darkTheme },
              { key: 'system' as const, label: s.systemTheme },
            ]).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTheme(opt.key)}
                className={cn('flex h-9 items-center rounded-xl border px-4 text-sm font-medium transition-colors',
                  theme === opt.key
                    ? 'border-primary-default bg-primary-subtle text-primary-default'
                    : 'border-border-primary text-fg-secondary hover:text-fg-primary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormSection>

        {/* Save */}
        <div className="flex">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl"
          >
            {isSaving ? common.loading : common.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
