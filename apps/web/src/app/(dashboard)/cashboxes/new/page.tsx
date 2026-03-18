import { ErrorBoundary } from '@hesabdari/ui';
import { CashboxForm } from '@/features/treasury';

export default function NewCashboxPage() {
  return (
    <ErrorBoundary>
      <CashboxForm />
    </ErrorBoundary>
  );
}
