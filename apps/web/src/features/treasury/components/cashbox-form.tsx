'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  Checkbox,
  FormField,
  FormLabel,
  FormErrorBanner,
  MoneyInput,
  DatePicker,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { FormSection, FormActions, DataPageHeader } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCreateCashbox, type CreateCashboxInput } from '../hooks/use-cashboxes';
import { useDefaultCurrencyId } from '@/features/shared/hooks/use-currencies';
import { ApiError } from '@hesabdari/api-client';

const tr = t('treasury');
const common = t('common');
const msgs = t('messages');

export function CashboxForm() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateCashbox();
  const [formError, setFormError] = useState<string | null>(null);
  const currencyId = useDefaultCurrencyId();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCashboxInput>({
    defaultValues: { isActive: true, openingBalance: { amount: '', date: '', description: '' } },
  });

  const onSubmit = async (data: CreateCashboxInput) => {
    setFormError(null);
    try {
      const payload = {
        ...data,
        currencyId: currencyId ?? '00000000-0000-0000-0000-000000000001',
      };
      if (!payload.openingBalance?.amount || !payload.openingBalance?.date) {
        delete payload.openingBalance;
      }
      await createMutation.mutateAsync(payload);
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
      <DataPageHeader title={tr.newCashbox} subtitle={tr.cashboxSubtitle} />

      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {formError && <FormErrorBanner message={formError} />}

        <FormSection title={common.basicInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.code?.message}>
              <FormLabel>{tr.cashboxCode}</FormLabel>
              <Input
                {...register('code', { required: true })}
                placeholder="CB-001"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField error={errors.name?.message}>
              <FormLabel>{tr.cashboxName}</FormLabel>
              <Input
                {...register('name', { required: true })}
                placeholder={tr.cashboxName}
                className="rounded-xl"
              />
            </FormField>
            <div className="flex items-center gap-2 pt-6">
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
              <label htmlFor="isActive" className="text-sm text-fg-primary cursor-pointer">
                {common.active}
              </label>
            </div>
          </div>
        </FormSection>

        <FormSection title={tr.openingBalance} description={tr.openingBalanceDesc}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField>
              <FormLabel>
                {tr.balanceAmount} ({common.rial})
              </FormLabel>
              <Controller
                name="openingBalance.amount"
                control={control}
                render={({ field }) => (
                  <MoneyInput
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    suffix={common.rial}
                  />
                )}
              />
            </FormField>
            <FormField>
              <FormLabel>{tr.balanceDate}</FormLabel>
              <Controller
                name="openingBalance.date"
                control={control}
                render={({ field }) => (
                  <DatePicker value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
            </FormField>
            <FormField>
              <FormLabel>{common.description}</FormLabel>
              <Input
                {...register('openingBalance.description')}
                placeholder={tr.openingBalanceDesc}
                className="rounded-xl"
              />
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
