'use client';

import { Spinner, EmptyState } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { useInvoice } from '../hooks/use-invoices';
import { InvoiceForm } from './invoice-form';
import { DataPageHeader } from '@/features/shared';

const msgs = t('messages');
const inv = t('invoice');

export function InvoiceEditPage({ invoiceId }: { invoiceId: string }) {
  const { data: invoice, isLoading, isError } = useInvoice(invoiceId);

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
        title="فاکتور یافت نشد"
        description={msgs.unexpectedError}
      />
    );
  }

  if (invoice.status !== 'DRAFT') {
    return (
      <EmptyState
        title="ویرایش امکان‌پذیر نیست"
        description="فقط فاکتورهای پیش‌نویس قابل ویرایش هستند. برای اصلاح فاکتور تأیید شده، سند برگشت ثبت کنید."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <DataPageHeader
        title={`ویرایش ${inv.title}`}
        subtitle={`فاکتور ${invoice.invoiceNumber}`}
      />
      <InvoiceForm initialData={invoice} />
    </div>
  );
}
