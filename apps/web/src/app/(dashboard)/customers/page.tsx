import { t } from '@/shared/lib/i18n';

const c = t('customer');

export default function CustomersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg-primary">{c.title}</h1>
      <p className="mt-2 text-fg-secondary">{c.subtitle}</p>
    </div>
  );
}
