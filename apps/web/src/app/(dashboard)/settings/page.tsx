import { t } from '@/shared/lib/i18n';

const s = t('settings');

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg-primary">{s.title}</h1>
      <p className="mt-2 text-fg-secondary">{s.subtitle}</p>
    </div>
  );
}
