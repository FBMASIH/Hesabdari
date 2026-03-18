'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createVendorSchema, type CreateVendorDto } from '@hesabdari/contracts';
import { Input, Textarea, MoneyInput, FormField, FormLabel, FormErrorBanner } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { FormSection, FormActions, DataPageHeader } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCreateVendor } from '../hooks/use-vendors';
import { ApiError } from '@hesabdari/api-client';

const vnd = t('vendor');
const common = t('common');
const msgs = t('messages');

export function VendorForm() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateVendor();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateVendorDto>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: { isActive: true },
  });

  const onSubmit = async (data: CreateVendorDto) => {
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
    <div className="flex flex-col">
      <DataPageHeader title={vnd.newVendor} subtitle={vnd.newVendorSubtitle} />

      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {formError && <FormErrorBanner message={formError} />}

        <FormSection title={common.basicInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.code?.message}>
              <FormLabel>{vnd.vendorCode}</FormLabel>
              <Input {...register('code')} placeholder="V-001" className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
            <FormField error={errors.name?.message}>
              <FormLabel>{vnd.vendorName}</FormLabel>
              <Input {...register('name')} placeholder={vnd.namePlaceholder} className="rounded-xl" />
            </FormField>
            <FormField error={errors.phone1?.message}>
              <FormLabel>{vnd.phone}</FormLabel>
              <Input {...register('phone1')} placeholder="۰۲۱-۱۲۳۴۵۶۷۸" className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
          </div>
        </FormSection>

        <FormSection title={common.additionalInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.nationalId?.message}>
              <FormLabel>{vnd.nationalId}</FormLabel>
              <Input {...register('nationalId')} className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
            <FormField error={errors.economicCode?.message}>
              <FormLabel>{vnd.economicCode}</FormLabel>
              <Input {...register('economicCode')} className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
            <FormField error={errors.postalCode?.message}>
              <FormLabel>{vnd.postalCode}</FormLabel>
              <Input {...register('postalCode')} className="rounded-xl ltr-text" dir="ltr" />
            </FormField>
            <FormField error={errors.creditLimit?.message}>
              <FormLabel>{common.creditLimit} ({common.rial})</FormLabel>
              <MoneyInput
                value={watch('creditLimit') ?? ''}
                onChange={(v) => setValue('creditLimit', v, { shouldValidate: true })}
                suffix="\uFDFC"
                placeholder="0"
                className="rounded-xl"
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField error={errors.address?.message}>
              <FormLabel>{vnd.address}</FormLabel>
              <Textarea {...register('address')} placeholder={vnd.addressPlaceholder} className="rounded-xl resize-none" rows={2} />
            </FormField>
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
