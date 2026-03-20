import { ErrorBoundary } from '@hesabdari/ui';
import { VendorForm } from '@/features/vendors';
import { VendorEditLoader } from './vendor-edit-loader';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { VendorDto } from '@/features/vendors';

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let entity: VendorDto | undefined;
  try {
    const { client, orgId } = await createServerClient();
    entity = await client.get(serverOrgPath(orgId, `/vendors/${id}`));
  } catch {
    // Server fetch failed — fall back to client-side loader
  }

  return (
    <ErrorBoundary>
      {entity ? <VendorForm initialData={entity} /> : <VendorEditLoader vendorId={id} />}
    </ErrorBoundary>
  );
}
