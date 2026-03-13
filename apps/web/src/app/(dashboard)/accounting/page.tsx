import { t } from '@/shared/lib/i18n';

const a = t('accounting');

export default function AccountingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg-primary">{a.chartOfAccounts}</h1>
      <p className="mt-2 text-fg-secondary">{a.chartOfAccountsDesc}</p>
    </div>
  );
}
