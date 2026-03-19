'use client';

import { Spinner, EmptyState, IconDelivery } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { VendorForm, useVendor } from '@/features/vendors';

const vnd = t('vendor');
const msgs = t('messages');

export function VendorEditLoader({ vendorId }: { vendorId: string }) {
  const { data: vendor, isLoading, isError } = useVendor(vendorId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <EmptyState
        icon={<IconDelivery size={20} />}
        title={vnd.notFound}
        description={msgs.unexpectedError}
      />
    );
  }

  return <VendorForm initialData={vendor} />;
}
