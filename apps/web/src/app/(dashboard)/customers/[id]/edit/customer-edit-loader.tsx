'use client';

import { Spinner, EmptyState, IconUsersGroup } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { CustomerForm, useCustomer } from '@/features/customers';

const cust = t('customer');
const msgs = t('messages');

export function CustomerEditLoader({ customerId }: { customerId: string }) {
  const { data: customer, isLoading, isError } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <EmptyState
        icon={<IconUsersGroup size={20} />}
        title={cust.notFound}
        description={msgs.unexpectedError}
      />
    );
  }

  return <CustomerForm initialData={customer} />;
}
