import { ErrorBoundary } from '@hesabdari/ui';
import { CustomerForm } from '@/features/customers';

export default function NewCustomerPage() {
  return (
    <ErrorBoundary>
      <CustomerForm />
    </ErrorBoundary>
  );
}
