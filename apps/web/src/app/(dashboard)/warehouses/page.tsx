import { ErrorBoundary } from '@hesabdari/ui';
import { WarehouseListPage } from '@/features/inventory';

export default function WarehousesPage() {
  return (
    <ErrorBoundary>
      <WarehouseListPage />
    </ErrorBoundary>
  );
}
