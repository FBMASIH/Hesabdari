import { t } from '@/shared/lib/i18n';

const r = t('reports');

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg-primary">{r.title}</h1>
      <p className="mt-2 text-fg-secondary">{r.subtitle}</p>
    </div>
  );
}
