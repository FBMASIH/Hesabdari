import { t } from '@/shared/lib/i18n';

const j = t('journal');

export default function JournalEntriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg-primary">{j.title}</h1>
      <p className="mt-2 text-fg-secondary">{j.subtitle}</p>
    </div>
  );
}
