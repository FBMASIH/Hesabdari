import { ErrorBoundary } from '@hesabdari/ui';
import { CashboxListPage } from '@/features/treasury';

export default function CashboxesPage() {
  return (
    <ErrorBoundary>
      <CashboxListPage />
    </ErrorBoundary>
  );
}
