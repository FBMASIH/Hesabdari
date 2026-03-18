import { ErrorBoundary } from '@hesabdari/ui';
import { ReceivedChequeForm } from '@/features/treasury';

export default function NewReceivedChequePage() {
  return (
    <ErrorBoundary>
      <ReceivedChequeForm />
    </ErrorBoundary>
  );
}
