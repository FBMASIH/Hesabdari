import { ErrorBoundary } from '@hesabdari/ui';
import { InvoiceEditPage } from '@/features/invoices';

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ErrorBoundary>
      <InvoiceEditPageWrapper params={params} />
    </ErrorBoundary>
  );
}

async function InvoiceEditPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoiceEditPage invoiceId={id} />;
}
