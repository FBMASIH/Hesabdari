import { ErrorBoundary } from '@hesabdari/ui';
import { VendorListPage } from '@/features/vendors';

export default function VendorsPage() {
  return (
    <ErrorBoundary>
      <VendorListPage />
    </ErrorBoundary>
  );
}
