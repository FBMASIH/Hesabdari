import { ErrorBoundary } from '@hesabdari/ui';
import { ProductEditLoader } from './product-edit-loader';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ErrorBoundary>
      <ProductEditLoader productId={id} />
    </ErrorBoundary>
  );
}
