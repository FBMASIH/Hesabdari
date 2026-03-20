import { ErrorBoundary } from '@hesabdari/ui';
import { WarehouseForm } from '@/features/inventory';

export default function NewWarehousePage() {
  return (
    <ErrorBoundary>
      <WarehouseForm />
    </ErrorBoundary>
  );
}
