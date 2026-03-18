import { ErrorBoundary } from '@hesabdari/ui';
import { PaidChequeListPage } from '@/features/treasury';

export default function PaidChequesPage() {
  return (
    <ErrorBoundary>
      <PaidChequeListPage />
    </ErrorBoundary>
  );
}
