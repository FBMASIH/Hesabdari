import { ErrorBoundary } from '@hesabdari/ui';
import { VendorEditLoader } from './vendor-edit-loader';

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ErrorBoundary>
      <VendorEditLoader vendorId={id} />
    </ErrorBoundary>
  );
}
