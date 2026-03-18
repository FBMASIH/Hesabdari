import { ErrorBoundary } from '@hesabdari/ui';
import { ReportsPage } from '@/features/reports';

export default function ReportsRoute() {
  return (
    <ErrorBoundary>
      <ReportsPage />
    </ErrorBoundary>
  );
}
