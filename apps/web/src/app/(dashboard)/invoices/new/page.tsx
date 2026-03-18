import { ErrorBoundary } from '@hesabdari/ui';
import { InvoiceForm } from '@/features/invoices';

export default function NewInvoicePage() {
  return (
    <ErrorBoundary>
      <InvoiceForm />
    </ErrorBoundary>
  );
}
