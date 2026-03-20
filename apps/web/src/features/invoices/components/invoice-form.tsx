'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  DatePicker,
  MoneyInput,
  FormField,
  FormLabel,
  FormErrorBanner,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  ConfirmDialog,
  IconClose,
  IconPlus,
} from '@hesabdari/ui';
import { ApiError } from '@hesabdari/api-client';
import { t } from '@/shared/lib/i18n';
import { formatMoney } from '@/shared/lib/money';
import { toPersianDigits } from '@/shared/lib/date';
import {
  FormSection,
  FormActions,
  SearchableSelect,
  type SearchableSelectOption,
} from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import {
  useCreateInvoice,
  useUpdateInvoice,
  useConfirmInvoice,
  type InvoiceDto,
} from '../hooks/use-invoices';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { useVendors } from '@/features/vendors/hooks/use-vendors';
import { useProducts } from '@/features/shared/hooks/use-products';
import { useDefaultCurrencyId } from '@/features/shared/hooks/use-currencies';

// ── Types ───────────────────────────────────────────

type DocumentType = 'SALES' | 'PURCHASE' | 'SALES_RETURN' | 'PURCHASE_RETURN' | 'PROFORMA';

interface InvoiceLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: bigint; // Rial
  discount: bigint; // Rial
  tax: bigint; // Rial
}

// ── i18n ────────────────────────────────────────────

const inv = t('invoice');
const common = t('common');
const msgs = t('messages');
const val = t('validation');

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'SALES', label: inv.types.sales },
  { value: 'PURCHASE', label: inv.types.purchase },
  { value: 'SALES_RETURN', label: inv.types.salesReturn },
  { value: 'PURCHASE_RETURN', label: inv.types.purchaseReturn },
  { value: 'PROFORMA', label: inv.types.proforma },
];

function createLineId(counter: { current: number }): string {
  return `line-${++counter.current}`;
}

function lineTotal(line: InvoiceLine): bigint {
  return BigInt(line.quantity) * line.unitPrice - line.discount + line.tax;
}

// ── Component ───────────────────────────────────────

interface InvoiceFormProps {
  /** Pre-populate for edit mode. */
  initialData?: InvoiceDto;
}

export function InvoiceForm({ initialData }: InvoiceFormProps = {}) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const confirmMutation = useConfirmInvoice();
  const isEditMode = !!initialData;
  const currencyId = useDefaultCurrencyId();
  const lineIdCounter = useRef(0);
  const newLine = useCallback(
    (): InvoiceLine => ({
      id: createLineId(lineIdCounter),
      productId: '',
      quantity: 1,
      unitPrice: 0n,
      discount: 0n,
      tax: 0n,
    }),
    [],
  );

  // Form state — pre-populate from initialData if editing
  const [docType, setDocType] = useState<DocumentType>(initialData?.documentType ?? 'SALES');
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber ?? '');
  const [invoiceDate, setInvoiceDate] = useState(initialData?.invoiceDate ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [partyId, setPartyId] = useState(
    initialData?.customer?.id ?? initialData?.vendor?.id ?? '',
  );
  const [lines, setLines] = useState<InvoiceLine[]>(() =>
    initialData?.lines?.length
      ? initialData.lines.map((l) => ({
          id: createLineId(lineIdCounter),
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: BigInt(l.unitPrice),
          discount: BigInt(l.discount),
          tax: BigInt(l.tax),
        }))
      : [newLine()],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSalesType = docType === 'SALES' || docType === 'SALES_RETURN' || docType === 'PROFORMA';
  const partyLabel = isSalesType ? inv.customerParty : inv.vendorParty;

  // Entity data hooks — loaded once, SearchableSelect filters client-side
  const customerList = useCustomers({ pageSize: 100 });
  const vendorList = useVendors({ pageSize: 100 });
  const productList = useProducts({ pageSize: 100 });

  const partyOptions: SearchableSelectOption[] = isSalesType
    ? (customerList.data?.data ?? []).map((c) => ({ id: c.id, label: c.name, sublabel: c.code }))
    : (vendorList.data?.data ?? []).map((v) => ({ id: v.id, label: v.name, sublabel: v.code }));

  const productOptions: SearchableSelectOption[] = (productList.data?.data ?? []).map((p) => ({
    id: p.id,
    label: p.name,
    sublabel: p.code,
  }));

  // Calculations
  const totals = useMemo(() => {
    let subtotal = 0n;
    let totalDiscount = 0n;
    let totalTax = 0n;
    for (const line of lines) {
      subtotal += BigInt(line.quantity) * line.unitPrice;
      totalDiscount += line.discount;
      totalTax += line.tax;
    }
    return { subtotal, totalDiscount, totalTax, grandTotal: subtotal - totalDiscount + totalTax };
  }, [lines]);

  // Line item handlers
  const addLine = useCallback(() => {
    setLines((prev) => [...prev, newLine()]);
  }, [newLine]);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }, []);

  const updateLine = useCallback(
    (id: string, field: keyof InvoiceLine, value: string | number | bigint) => {
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    },
    [],
  );

  // Validation
  function validate(): string[] {
    const errors: string[] = [];
    if (!currencyId) errors.push(`${common.currency}: ${val.required}`);
    if (!invoiceNumber.trim()) errors.push(`${inv.invoiceNumber}: ${val.required}`);
    if (!invoiceDate.trim()) errors.push(`${inv.invoiceDate}: ${val.required}`);
    if (!partyId) errors.push(`${partyLabel}: ${val.required}`);
    if (lines.every((l) => !l.productId)) errors.push(`${inv.lines}: ${inv.atLeastOneLine}`);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l && l.productId && l.quantity <= 0) {
        errors.push(`${inv.lineRow(toPersianDigits(i + 1))}: ${val.positiveNumber}`);
      }
    }
    return errors;
  }

  async function handleSubmit(asDraft: boolean) {
    setFormError(null);
    const errors = validate();
    if (errors.length > 0) {
      setFormError(errors.join(' | '));
      return;
    }

    if (!asDraft) {
      setConfirmOpen(true);
      return;
    }

    await doSubmit('DRAFT');
  }

  /** Build the contract-shaped payload from form state. */
  function buildPayload() {
    const filledLines = lines.filter((l) => l.productId);
    const payload: Record<string, unknown> = {
      documentType: docType,
      invoiceNumber,
      invoiceDate: invoiceDate || undefined,
      dueDate: dueDate || undefined,
      currencyId: currencyId ?? '',
      lines: filledLines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice.toString(),
        discount: l.discount.toString(),
        tax: l.tax.toString(),
        totalPrice: lineTotal(l).toString(),
      })),
    };
    if (isSalesType) {
      payload.customerId = partyId;
    } else {
      payload.vendorId = partyId;
    }
    return payload;
  }

  async function doSubmit(status: 'DRAFT' | 'CONFIRMED') {
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      let invoiceId: string;

      if (isEditMode && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload });
        invoiceId = initialData.id;
      } else {
        const created = await createMutation.mutateAsync(payload);
        invoiceId = created.id;
      }

      if (status === 'CONFIRMED') {
        await confirmMutation.mutateAsync(invoiceId);
      }

      showToast({
        title: isEditMode
          ? inv.invoiceUpdated
          : status === 'DRAFT'
            ? inv.draftSaved
            : inv.invoiceConfirmed,
        variant: 'success',
      });
      router.push('/invoices');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : msgs.unexpectedError;
      setFormError(msg);
      showToast({ title: msg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(false);
      }}
      className="flex flex-col gap-5"
    >
      {formError && <FormErrorBanner message={formError} />}

      {/* ── Header fields ── */}
      <FormSection title={inv.invoiceInfo}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Document type */}
          <FormField>
            <FormLabel>{inv.documentType}</FormLabel>
            <Select
              value={docType}
              onValueChange={(v) => {
                setDocType(v as DocumentType);
                setPartyId('');
              }}
            >
              <SelectTrigger className="rounded-xl">
                <span>{DOC_TYPES.find((d) => d.value === docType)?.label}</span>
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Invoice number */}
          <FormField>
            <FormLabel>{inv.invoiceNumber}</FormLabel>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="S-1405"
              className="rounded-xl ltr-text"
              dir="ltr"
            />
          </FormField>

          {/* Invoice date */}
          <FormField>
            <FormLabel>{inv.invoiceDate}</FormLabel>
            <DatePicker value={invoiceDate} onChange={setInvoiceDate} />
          </FormField>

          {/* Due date */}
          <FormField>
            <FormLabel>{inv.dueDate}</FormLabel>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </FormField>
        </div>

        {/* Party */}
        <div className="mt-5 max-w-md">
          <FormField>
            <FormLabel>{partyLabel}</FormLabel>
            <SearchableSelect
              value={partyId}
              onChange={setPartyId}
              options={partyOptions}
              isLoading={isSalesType ? customerList.isLoading : vendorList.isLoading}
              placeholder={inv.searchParty(partyLabel)}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ── Line items ── */}
      <FormSection title={inv.lines} description={inv.linesDescription}>
        <div className="overflow-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-border-secondary">
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-8">#</th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary min-w-[160px]">
                  {inv.product}
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-20">
                  {inv.quantity}
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-32">
                  {inv.unitPrice} ({common.rial})
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-28">
                  {inv.discount}
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-28">
                  {inv.tax}
                </th>
                <th className="py-2 pe-3 text-start text-xs font-medium text-fg-tertiary w-32">
                  {inv.lineTotal}
                </th>
                <th className="py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={line.id} className="border-b border-border-secondary/30">
                  <td className="py-2 pe-3 text-xs text-fg-tertiary">{toPersianDigits(idx + 1)}</td>
                  <td className="py-2 pe-3">
                    <SearchableSelect
                      value={line.productId}
                      onChange={(v) => updateLine(line.id, 'productId', v)}
                      options={productOptions}
                      isLoading={productList.isLoading}
                      placeholder={inv.searchProduct}
                    />
                  </td>
                  <td className="py-2 pe-3">
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.id, 'quantity', Math.max(1, Number(e.target.value)))
                      }
                      className="h-8 rounded-lg text-center text-xs ltr-text"
                      dir="ltr"
                    />
                  </td>
                  <td className="py-2 pe-3">
                    <MoneyInput
                      value={line.unitPrice > 0n ? line.unitPrice.toString() : ''}
                      onChange={(v) => updateLine(line.id, 'unitPrice', v ? BigInt(v) : 0n)}
                      suffix={common.rial}
                      className="h-8 rounded-lg text-xs"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 pe-3">
                    <MoneyInput
                      value={line.discount > 0n ? line.discount.toString() : ''}
                      onChange={(v) => updateLine(line.id, 'discount', v ? BigInt(v) : 0n)}
                      suffix={common.rial}
                      className="h-8 rounded-lg text-xs"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 pe-3">
                    <MoneyInput
                      value={line.tax > 0n ? line.tax.toString() : ''}
                      onChange={(v) => updateLine(line.id, 'tax', v ? BigInt(v) : 0n)}
                      suffix={common.rial}
                      className="h-8 rounded-lg text-xs"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 pe-3 tabular-nums text-xs font-medium text-fg-primary">
                    {lineTotal(line) > 0n ? formatMoney(lineTotal(line), { showUnit: false }) : '—'}
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      className="rounded-lg p-1 text-fg-tertiary hover:bg-danger-subtle hover:text-danger-default transition-colors disabled:opacity-30"
                      aria-label={common.deleteRow}
                    >
                      <IconClose size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={addLine} className="mt-3 gap-1.5">
          <IconPlus size={16} />
          {inv.addLine}
        </Button>
      </FormSection>

      {/* ── Totals ── */}
      <div className="glass-surface-static rounded-2xl p-6">
        <div className="flex flex-col gap-2.5 sm:items-start sm:max-w-sm">
          <div className="flex items-center justify-between gap-8 text-sm w-full">
            <span className="text-fg-secondary">{inv.subtotal}</span>
            <span className="tabular-nums font-medium text-fg-primary">
              {formatMoney(totals.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8 text-sm w-full">
            <span className="text-fg-secondary">{inv.totalDiscount}</span>
            <span className="tabular-nums text-danger-default">
              {totals.totalDiscount > 0n ? `−${formatMoney(totals.totalDiscount)}` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8 text-sm w-full">
            <span className="text-fg-secondary">{inv.totalTax}</span>
            <span className="tabular-nums text-fg-primary">
              {totals.totalTax > 0n ? formatMoney(totals.totalTax) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8 border-t border-border-secondary pt-2 w-full">
            <span className="text-base font-semibold text-fg-primary">{inv.grandTotal}</span>
            <span className="tabular-nums text-base font-bold text-fg-primary">
              {formatMoney(totals.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <FormActions
        submitLabel={inv.confirmAndSubmit}
        secondaryAction={{
          label: inv.saveDraft,
          onClick: () => handleSubmit(true),
        }}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={inv.confirmTitle}
        description={inv.confirmDescription(invoiceNumber || '—', formatMoney(totals.grandTotal))}
        confirmLabel={inv.confirmLabel}
        onConfirm={() => doSubmit('CONFIRMED')}
      />
    </form>
  );
}
