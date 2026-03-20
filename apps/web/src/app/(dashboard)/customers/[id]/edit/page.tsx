import { ErrorBoundary } from '@hesabdari/ui';
import { CustomerForm } from '@/features/customers';
import { CustomerEditLoader } from './customer-edit-loader';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { CustomerDto } from '@/features/customers';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let customer: CustomerDto | undefined;
  try {
    const { client, orgId } = await createServerClient();
    customer = await client.get(serverOrgPath(orgId, `/customers/${id}`));
  } catch {
    // Server fetch failed — fall back to client-side loader
  }

  return (
    <ErrorBoundary>
      {customer ? <CustomerForm initialData={customer} /> : <CustomerEditLoader customerId={id} />}
    </ErrorBoundary>
  );
}
