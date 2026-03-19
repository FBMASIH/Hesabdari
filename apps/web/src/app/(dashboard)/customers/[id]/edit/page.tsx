import { ErrorBoundary } from '@hesabdari/ui';
import { CustomerEditLoader } from './customer-edit-loader';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ErrorBoundary>
      <CustomerEditLoader customerId={id} />
    </ErrorBoundary>
  );
}
