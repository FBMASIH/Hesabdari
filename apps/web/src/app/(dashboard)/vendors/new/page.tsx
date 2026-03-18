import { ErrorBoundary } from '@hesabdari/ui';
import { VendorForm } from '@/features/vendors';

export default function NewVendorPage() {
  return (
    <ErrorBoundary>
      <VendorForm />
    </ErrorBoundary>
  );
}
