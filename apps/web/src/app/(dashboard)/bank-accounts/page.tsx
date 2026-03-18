import { ErrorBoundary } from '@hesabdari/ui';
import { BankAccountListPage } from '@/features/treasury';

export default function BankAccountsPage() {
  return (
    <ErrorBoundary>
      <BankAccountListPage />
    </ErrorBoundary>
  );
}
