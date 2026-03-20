import { ErrorBoundary } from '@hesabdari/ui';
import { InvoiceEditPage } from '@/features/invoices';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { InvoiceDto } from '@/features/invoices';

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let entity: InvoiceDto | undefined;
  try {
    const { client, orgId } = await createServerClient();
    entity = await client.get(serverOrgPath(orgId, `/invoices/${id}`));
  } catch {
    // Server fetch failed — fall back to client-side loader
  }

  return (
    <ErrorBoundary>
      <InvoiceEditPage invoiceId={id} initialData={entity} />
    </ErrorBoundary>
  );
}
