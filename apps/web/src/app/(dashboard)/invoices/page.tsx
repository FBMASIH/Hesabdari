import { ErrorBoundary } from '@hesabdari/ui';
import { InvoiceListPage } from '@/features/invoices';

export default function InvoicesPage() {
  return (
    <ErrorBoundary>
      <InvoiceListPage />
    </ErrorBoundary>
  );
}
