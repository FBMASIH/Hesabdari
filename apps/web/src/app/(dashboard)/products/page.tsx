import { ErrorBoundary } from '@hesabdari/ui';
import { ProductListPage } from '@/features/inventory';

export default function ProductsPage() {
  return (
    <ErrorBoundary>
      <ProductListPage />
    </ErrorBoundary>
  );
}
