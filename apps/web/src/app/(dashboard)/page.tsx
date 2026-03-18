import { ErrorBoundary } from '@hesabdari/ui';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardOverview />
    </ErrorBoundary>
  );
}
