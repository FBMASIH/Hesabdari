'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Input,
  MoneyInput,
  FormField,
  FormLabel,
  FormErrorBanner,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@hesabdari/ui';
import { ApiError } from '@hesabdari/api-client';
import { t } from '@/shared/lib/i18n';
import { FormSection, FormActions, DataPageHeader } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import {
  useCreateProduct,
  useUpdateProduct,
  useSaveProductStocks,
  type CreateProductPayload,
  type ProductDetailDto,
} from '../hooks/use-products-crud';
import { useWarehouses, type WarehouseDto } from '../hooks/use-warehouses';

const prod = t('product');
const common = t('common');
const msgs = t('messages');
const val = t('validation');

interface StockRow {
  warehouseId: string;
  warehouseName: string;
  quantity: string;
  purchasePrice: string;
}

interface ProductFormProps {
  initialData?: ProductDetailDto;
}

export function ProductForm({ initialData }: ProductFormProps = {}) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const isEditing = !!initialData?.id;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const saveStocksMutation = useSaveProductStocks();

  const [code, setCode] = useState(initialData?.code ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [barcode, setBarcode] = useState(initialData?.barcode ?? '');
  const [countingUnit, setCountingUnit] = useState(initialData?.countingUnit ?? '');
  const [majorUnit, setMajorUnit] = useState(initialData?.majorUnit ?? '');
  const [minorUnit, setMinorUnit] = useState(initialData?.minorUnit ?? '');
  const [quantityInMajorUnit, setQuantityInMajorUnit] = useState(
    initialData?.quantityInMajorUnit?.toString() ?? '',
  );
  const [salePrice1, setSalePrice1] = useState(initialData?.salePrice1 ?? '');
  const [salePrice2, setSalePrice2] = useState(initialData?.salePrice2 ?? '');
  const [salePrice3, setSalePrice3] = useState(initialData?.salePrice3 ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const warehouseQuery = useWarehouses({ pageSize: 100, isActive: true });
  const warehouses: WarehouseDto[] = warehouseQuery.data?.data ?? [];

  const [stockRows, setStockRows] = useState<StockRow[]>([]);

  useEffect(() => {
    if (warehouses.length > 0 && stockRows.length === 0) {
      setStockRows(
        warehouses.map((w) => ({
          warehouseId: w.id,
          warehouseName: w.name,
          quantity: '',
          purchasePrice: '',
        })),
      );
    }
  }, [warehouses, stockRows.length]);

  function updateStockRow(warehouseId: string, field: 'quantity' | 'purchasePrice', value: string) {
    setStockRows((prev) =>
      prev.map((r) => (r.warehouseId === warehouseId ? { ...r, [field]: value } : r)),
    );
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!code.trim()) errors.push(`${prod.productCode}: ${val.required}`);
    if (!name.trim()) errors.push(`${prod.productName}: ${val.required}`);
    if (!countingUnit.trim()) errors.push(`${prod.countingUnit}: ${val.required}`);
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errors = validate();
    if (errors.length > 0) {
      setFormError(errors.join(' | '));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateProductPayload = {
        code: code.trim(),
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        countingUnit: countingUnit.trim(),
        majorUnit: majorUnit.trim() || undefined,
        minorUnit: minorUnit.trim() || undefined,
        quantityInMajorUnit: quantityInMajorUnit ? parseInt(quantityInMajorUnit, 10) : undefined,
        salePrice1: salePrice1 || undefined,
        salePrice2: salePrice2 || undefined,
        salePrice3: salePrice3 || undefined,
      };

      if (isEditing && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload });
      } else {
        const created = await createMutation.mutateAsync(payload);

        // Opening stock only on create — never re-post on edit
        const filledStocks = stockRows.filter((r) => r.quantity && parseInt(r.quantity, 10) > 0);
        if (filledStocks.length > 0) {
          await saveStocksMutation.mutateAsync({
            productId: created.id,
            data: {
              stocks: filledStocks.map((r) => ({
                warehouseId: r.warehouseId,
                quantity: parseInt(r.quantity, 10),
                purchasePrice: r.purchasePrice || '0',
              })),
            },
          });
        }
      }

      showToast({ title: msgs.saveSuccess, variant: 'success' });
      router.push('/products');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : msgs.unexpectedError;
      setFormError(msg);
      showToast({ title: msg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-stagger">
      <DataPageHeader
        title={isEditing ? (prod.editProduct ?? 'ویرایش کالا') : prod.newProduct}
        subtitle={
          isEditing ? (prod.editProductSubtitle ?? 'ویرایش اطلاعات کالا') : prod.newProductSubtitle
        }
      />

      <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && <FormErrorBanner message={formError} />}

        <FormSection title={common.basicInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField>
              <FormLabel>{prod.productCode}</FormLabel>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="P-001"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.productName}</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={prod.productName}
                className="rounded-xl"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.barcode}</FormLabel>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.countingUnit}</FormLabel>
              <Input
                value={countingUnit}
                onChange={(e) => setCountingUnit(e.target.value)}
                placeholder={prod.countingUnit}
                className="rounded-xl"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.majorUnit}</FormLabel>
              <Input
                value={majorUnit}
                onChange={(e) => setMajorUnit(e.target.value)}
                placeholder={prod.majorUnit}
                className="rounded-xl"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.minorUnit}</FormLabel>
              <Input
                value={minorUnit}
                onChange={(e) => setMinorUnit(e.target.value)}
                placeholder={prod.minorUnit}
                className="rounded-xl"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.qtyInMajor}</FormLabel>
              <Input
                type="number"
                min={1}
                value={quantityInMajorUnit}
                onChange={(e) => setQuantityInMajorUnit(e.target.value)}
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title={prod.pricing}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField>
              <FormLabel>{prod.salePrice1}</FormLabel>
              <MoneyInput
                value={salePrice1}
                onChange={setSalePrice1}
                suffix={common.rial}
                placeholder="0"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.salePrice2}</FormLabel>
              <MoneyInput
                value={salePrice2}
                onChange={setSalePrice2}
                suffix={common.rial}
                placeholder="0"
              />
            </FormField>
            <FormField>
              <FormLabel>{prod.salePrice3}</FormLabel>
              <MoneyInput
                value={salePrice3}
                onChange={setSalePrice3}
                suffix={common.rial}
                placeholder="0"
              />
            </FormField>
          </div>
        </FormSection>

        {!isEditing && (
          <FormSection title={prod.openingStock} description={prod.openingStockDesc}>
            {warehouseQuery.isLoading && (
              <p className="text-sm text-fg-tertiary">{common.loading}</p>
            )}

            {!warehouseQuery.isLoading && warehouses.length === 0 && (
              <p className="text-sm text-fg-tertiary">{prod.noWarehouseYet}</p>
            )}

            {!warehouseQuery.isLoading && warehouses.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory').warehouse}</TableHead>
                    <TableHead>{prod.quantity}</TableHead>
                    <TableHead>{prod.purchasePrice}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockRows.map((row) => (
                    <TableRow key={row.warehouseId}>
                      <TableCell className="text-fg-primary font-medium">
                        {row.warehouseName}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={row.quantity}
                          onChange={(e) =>
                            updateStockRow(row.warehouseId, 'quantity', e.target.value)
                          }
                          className="h-8 w-24 rounded-lg text-center text-xs ltr-text"
                          dir="ltr"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <MoneyInput
                          value={row.purchasePrice}
                          onChange={(v) => updateStockRow(row.warehouseId, 'purchasePrice', v)}
                          suffix={common.rial}
                          placeholder="0"
                          className="h-8 w-36 text-xs"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </FormSection>
        )}

        <FormActions
          submitLabel={common.save}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
}
