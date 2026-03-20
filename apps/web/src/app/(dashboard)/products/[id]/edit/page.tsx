import { ErrorBoundary } from '@hesabdari/ui';
import { ProductForm } from '@/features/inventory';
import { ProductEditLoader } from './product-edit-loader';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { ProductDetailDto } from '@/features/inventory';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let entity: ProductDetailDto | undefined;
  try {
    const { client, orgId } = await createServerClient();
    entity = await client.get(serverOrgPath(orgId, `/products/${id}`));
  } catch {
    // Fall back to client-side loader
  }

  return (
    <ErrorBoundary>
      {entity ? <ProductForm initialData={entity} /> : <ProductEditLoader productId={id} />}
    </ErrorBoundary>
  );
}
