'use client';

import { Spinner, EmptyState, IconBox } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { ProductForm, useProduct } from '@/features/inventory';

const prod = t('product');
const msgs = t('messages');

export function ProductEditLoader({ productId }: { productId: string }) {
  const { data: product, isLoading, isError } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon={<IconBox size={20} />}
        title={prod.notFound}
        description={msgs.unexpectedError}
      />
    );
  }

  return <ProductForm initialData={product} />;
}
