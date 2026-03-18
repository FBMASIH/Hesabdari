import { ErrorBoundary } from '@hesabdari/ui';
import { ProductForm } from '@/features/inventory';

export default function NewProductPage() {
  return (
    <ErrorBoundary>
      <ProductForm />
    </ErrorBoundary>
  );
}
