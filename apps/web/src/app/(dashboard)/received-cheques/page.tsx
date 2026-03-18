import { ErrorBoundary } from '@hesabdari/ui';
import { ReceivedChequeListPage } from '@/features/treasury';

export default function ReceivedChequesPage() {
  return (
    <ErrorBoundary>
      <ReceivedChequeListPage />
    </ErrorBoundary>
  );
}
