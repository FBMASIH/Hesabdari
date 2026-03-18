import { ErrorBoundary } from '@hesabdari/ui';
import { PaidChequeForm } from '@/features/treasury';

export default function NewPaidChequePage() {
  return (
    <ErrorBoundary>
      <PaidChequeForm />
    </ErrorBoundary>
  );
}
