'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema, type CreateCustomerDto } from '@hesabdari/contracts';
import { Input, Textarea, MoneyInput, FormField, FormLabel, FormErrorBanner } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { FormSection, FormActions, DataPageHeader } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCreateCustomer, useUpdateCustomer, type CustomerDto } from '../hooks/use-customers';
import { ApiError } from '@hesabdari/api-client';

const cust = t('customer');
const common = t('common');
const msgs = t('messages');

interface CustomerFormProps {
  initialData?: CustomerDto;
}

export function CustomerForm({ initialData }: CustomerFormProps = {}) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isEditing = !!initialData?.id;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerDto>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          name: initialData.name,
          phone1: initialData.phone1 ?? undefined,
          address: initialData.address ?? undefined,
          creditLimit: initialData.creditLimit ?? undefined,
          nationalId: initialData.nationalId ?? undefined,
          isActive: initialData.isActive,
        }
      : { isActive: true },
  });

  async function onSubmit(data: CreateCustomerDto) {
    setFormError(null);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      showToast({ title: msgs.saveSuccess, variant: 'success' });
      router.back();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : msgs.unexpectedError;
      setFormError(msg);
      showToast({ title: msg, variant: 'error' });
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-stagger">
      <DataPageHeader
        title={isEditing ? cust.editCustomer : cust.newCustomer}
        subtitle={isEditing ? cust.editCustomerSubtitle : cust.newCustomerSubtitle}
      />

      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {formError && <FormErrorBanner message={formError} />}

        <FormSection title={common.basicInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.code?.message}>
              <FormLabel>{cust.customerCode}</FormLabel>
              <Input
                {...register('code')}
                placeholder="C-001"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField error={errors.name?.message}>
              <FormLabel>{cust.customerName}</FormLabel>
              <Input
                {...register('name')}
                placeholder={cust.namePlaceholder}
                className="rounded-xl"
              />
            </FormField>
            <FormField error={errors.phone1?.message}>
              <FormLabel>{cust.phone}</FormLabel>
              <Input
                {...register('phone1')}
                placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title={common.additionalInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.nationalId?.message}>
              <FormLabel>{cust.nationalId}</FormLabel>
              <Input {...register('nationalId')} className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
            <FormField error={errors.economicCode?.message}>
              <FormLabel>{cust.economicCode}</FormLabel>
              <Input {...register('economicCode')} className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
            <FormField error={errors.postalCode?.message}>
              <FormLabel>{cust.postalCode}</FormLabel>
              <Input {...register('postalCode')} className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
            <FormField error={errors.creditLimit?.message}>
              <FormLabel>
                {cust.creditLimit} ({common.rial})
              </FormLabel>
              <MoneyInput
                value={watch('creditLimit') ?? ''}
                onChange={(v) => setValue('creditLimit', v, { shouldValidate: true })}
                suffix={common.rial}
                placeholder="0"
                className="rounded-xl"
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField error={errors.address?.message}>
              <FormLabel>{cust.address}</FormLabel>
              <Textarea
                {...register('address')}
                placeholder={cust.addressPlaceholder}
                className="rounded-xl resize-none"
                rows={2}
              />
            </FormField>
          </div>
        </FormSection>

        <FormActions
          submitLabel={common.save}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting || createMutation.isPending || updateMutation.isPending}
        />
      </form>
    </div>
  );
}
