'use client';

import { useState } from 'react';
import { Button, Input, FormField, FormLabel, SegmentedControl } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { THEME_OPTIONS } from '@/shared/lib/theme';
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

  // TODO: wire to API when org settings endpoint exists
  const isStub = true;

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
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
              <FormLabel htmlFor="settings-org-name">{s.organizationName}</FormLabel>
              <Input
                id="settings-org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="settings-fiscal-year">{s.fiscalYear}</FormLabel>
              <Input
                id="settings-fiscal-year"
                value={jalaliCurrentFiscalYear()}
                readOnly
                className="bg-bg-secondary"
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="settings-currency">{s.defaultCurrency}</FormLabel>
              <Input
                id="settings-currency"
                value={`${common.rial} (IRR)`}
                readOnly
                className="bg-bg-secondary ltr-text"
                dir="ltr"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Theme */}
        <FormSection title={s.theme}>
          <SegmentedControl
            items={THEME_OPTIONS.map((opt) => ({
              key: opt.key,
              label: opt.label,
              icon: opt.icon ? <opt.icon size={14} /> : undefined,
            }))}
            value={theme}
            onChange={setTheme}
            label={s.theme}
            size="sm"
          />
        </FormSection>

        {/* Display preferences */}
        <FormSection title={s.language} description={s.displayPreferences}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField>
              <FormLabel htmlFor="settings-language">{s.language}</FormLabel>
              <Input
                id="settings-language"
                value={s.languageValue}
                readOnly
                className="bg-bg-secondary"
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="settings-amount-display">{s.amountDisplay}</FormLabel>
              <Input
                id="settings-amount-display"
                value={s.amountDisplayValue}
                readOnly
                className="bg-bg-secondary"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isStub}
            title={isStub ? s.comingSoon : undefined}
          >
            {isSaving ? common.loading : common.save}
          </Button>
          {isStub && <span className="text-xs text-fg-tertiary">{s.comingSoon}</span>}
        </div>
      </div>
    </div>
  );
}
