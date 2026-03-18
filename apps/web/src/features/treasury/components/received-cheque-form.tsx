'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  Textarea,
  FormField,
  FormLabel,
  FormErrorBanner,
  MoneyInput,
  DatePicker,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { FormSection, FormActions, DataPageHeader, SearchableSelect } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import {
  useCreateReceivedCheque,
  type CreateReceivedChequeInput,
} from '../hooks/use-received-cheques';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { useDefaultCurrencyId } from '@/features/shared/hooks/use-currencies';
import { ApiError } from '@hesabdari/api-client';

const tr = t('treasury');
const common = t('common');
const msgs = t('messages');

export function ReceivedChequeForm() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateReceivedCheque();
  const [formError, setFormError] = useState<string | null>(null);
  const customerList = useCustomers({ pageSize: 100 });
  const currencyId = useDefaultCurrencyId();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateReceivedChequeInput>({
    defaultValues: {
      chequeNumber: '',
      sayadiNumber: '',
      customerId: '',
      amount: '',
      date: '',
      dueDate: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateReceivedChequeInput) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        ...data,
        currencyId: currencyId ?? '00000000-0000-0000-0000-000000000001',
      });
      showToast({ title: msgs.saveSuccess, variant: 'success' });
      router.back();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : msgs.unexpectedError;
      setFormError(msg);
      showToast({ title: msg, variant: 'error' });
    }
  };

  const customerOptions = (customerList.data?.data ?? []).map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: c.code,
  }));

  return (
    <div className="flex flex-col">
      <DataPageHeader title={tr.newReceivedCheque} subtitle={tr.receivedChequeSubtitle} />

      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {formError && <FormErrorBanner message={formError} />}

        <FormSection title={common.basicInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.chequeNumber?.message}>
              <FormLabel>{tr.chequeNumber}</FormLabel>
              <Input
                {...register('chequeNumber', { required: true })}
                placeholder="123456"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField error={errors.sayadiNumber?.message}>
              <FormLabel>{tr.sayadiNumber}</FormLabel>
              <Input
                {...register('sayadiNumber')}
                placeholder="000000000000000000"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField error={errors.customerId?.message}>
              <FormLabel>{tr.drawer}</FormLabel>
              <Controller
                name="customerId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={(id) => {
                      field.onChange(id);
                    }}
                    options={customerOptions}
                    isLoading={customerList.isLoading}
                    placeholder={tr.searchReceivedCheque}
                  />
                )}
              />
            </FormField>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.amount?.message}>
              <FormLabel>
                {tr.chequeAmount} ({common.rial})
              </FormLabel>
              <Controller
                name="amount"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <MoneyInput value={field.value} onChange={field.onChange} suffix={common.rial} />
                )}
              />
            </FormField>
            <FormField error={errors.date?.message}>
              <FormLabel>{tr.chequeDate}</FormLabel>
              <Controller
                name="date"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
              />
            </FormField>
            <FormField error={errors.dueDate?.message}>
              <FormLabel>{tr.chequeDueDate}</FormLabel>
              <Controller
                name="dueDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField error={errors.description?.message}>
              <FormLabel>{common.description}</FormLabel>
              <Textarea
                {...register('description')}
                placeholder={common.description}
                className="rounded-xl resize-none"
                rows={2}
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
