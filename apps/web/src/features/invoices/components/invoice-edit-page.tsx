'use client';

import { Spinner, EmptyState, IconDocument, IconBan } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { useInvoice, type InvoiceDto } from '../hooks/use-invoices';
import { InvoiceForm } from './invoice-form';
import { DataPageHeader } from '@/features/shared';

const inv = t('invoice');
const msgs = t('messages');

export function InvoiceEditPage({
  invoiceId,
  initialData,
}: {
  invoiceId: string;
  initialData?: InvoiceDto;
}) {
  const { data: invoice, isLoading, isError } = useInvoice(invoiceId, initialData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <EmptyState
        icon={<IconDocument size={20} />}
        title={inv.notFound}
        description={msgs.unexpectedError}
      />
    );
  }

  if (invoice.status !== 'DRAFT') {
    return (
      <EmptyState
        icon={<IconBan size={20} />}
        title={inv.editNotAllowed}
        description={inv.editNotAllowedDescription}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={inv.editTitle(inv.title)}
        subtitle={inv.invoiceLabel(invoice.invoiceNumber)}
      />
      <InvoiceForm initialData={invoice} />
    </div>
  );
}
