import { ErrorBoundary } from '@hesabdari/ui';
import { AccountTreePage } from '@/features/accounting';

export default function AccountingPage() {
  return (
    <ErrorBoundary>
      <AccountTreePage />
    </ErrorBoundary>
  );
}
