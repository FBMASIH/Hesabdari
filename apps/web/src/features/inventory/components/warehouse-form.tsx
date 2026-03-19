'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWarehouseSchema, type CreateWarehouseDto } from '@hesabdari/contracts';
import {
  Input,
  Checkbox,
  FormField,
  FormLabel,
  FormErrorBanner,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { FormSection, FormActions, DataPageHeader } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCreateWarehouse } from '../hooks/use-warehouses';
import { ApiError } from '@hesabdari/api-client';

const wh = t('warehouse');
const common = t('common');
const msgs = t('messages');

const COSTING_OPTIONS = [
  { value: 'FIFO', label: wh.costingMethods.FIFO },
  { value: 'LIFO', label: wh.costingMethods.LIFO },
  { value: 'AVERAGE', label: wh.costingMethods.WEIGHTED_AVG },
] as const;

export function WarehouseForm() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateWarehouse();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateWarehouseDto>({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: { costingMethod: 'FIFO', isActive: true },
  });

  const onSubmit = async (data: CreateWarehouseDto) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync(data);
      showToast({ title: msgs.saveSuccess, variant: 'success' });
      router.back();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : msgs.unexpectedError;
      setFormError(msg);
      showToast({ title: msg, variant: 'error' });
    }
  };

  return (
    <div className="flex flex-col animate-stagger">
      <DataPageHeader title={wh.newWarehouse} subtitle={wh.newWarehouseSubtitle} />

      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {formError && <FormErrorBanner message={formError} />}

        <FormSection title={common.basicInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.code?.message}>
              <FormLabel>{wh.warehouseCode}</FormLabel>
              <Input
                {...register('code')}
                placeholder="W-001"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField error={errors.name?.message}>
              <FormLabel>{wh.warehouseName}</FormLabel>
              <Input {...register('name')} placeholder={wh.warehouseName} className="rounded-xl" />
            </FormField>
            <FormField error={errors.costingMethod?.message}>
              <FormLabel>{wh.costingMethod}</FormLabel>
              <Controller
                name="costingMethod"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-xl">
                      <span>{COSTING_OPTIONS.find((o) => o.value === field.value)?.label}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {COSTING_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <label
              htmlFor="isActive"
              className="text-sm text-fg-primary cursor-pointer select-none"
            >
              {common.active}
            </label>
          </div>
        </FormSection>

        <FormActions
          submitLabel={common.save}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting || createMutation.isPending}
        />
      </form>
    </div>
  );
}
