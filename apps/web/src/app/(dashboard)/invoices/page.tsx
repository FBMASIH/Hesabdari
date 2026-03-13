import { t } from '@/shared/lib/i18n';

const inv = t('invoice');

export default function InvoicesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg-primary">{inv.title}</h1>
      <p className="mt-2 text-fg-secondary">{inv.subtitle}</p>
    </div>
  );
}
