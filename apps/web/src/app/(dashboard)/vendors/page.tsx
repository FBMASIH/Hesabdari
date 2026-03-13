import { t } from '@/shared/lib/i18n';

const v = t('vendor');

export default function VendorsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg-primary">{v.title}</h1>
      <p className="mt-2 text-fg-secondary">{v.subtitle}</p>
    </div>
  );
}
