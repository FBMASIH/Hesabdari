import { ErrorBoundary } from '@hesabdari/ui';
import { CustomerListPage } from '@/features/customers';

export default function CustomersPage() {
  return (
    <ErrorBoundary>
      <CustomerListPage />
    </ErrorBoundary>
  );
}
