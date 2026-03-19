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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { FormSection, FormActions, DataPageHeader } from '@/features/shared';
import { useAppToast } from '@/providers/toast-provider';
import { useCreateBankAccount, type CreateBankAccountInput } from '../hooks/use-bank-accounts';
import { useDefaultCurrencyId } from '@/features/shared/hooks/use-currencies';
import { ApiError } from '@hesabdari/api-client';

const tr = t('treasury');
const common = t('common');
const msgs = t('messages');

// Iranian banks — static list until the banks API is available
const IRANIAN_BANKS = [
  { value: 'melli', label: 'بانک ملی ایران' },
  { value: 'sepah', label: 'بانک سپه' },
  { value: 'mellat', label: 'بانک ملت' },
  { value: 'tejarat', label: 'بانک تجارت' },
  { value: 'saderat', label: 'بانک صادرات ایران' },
  { value: 'maskan', label: 'بانک مسکن' },
  { value: 'refah', label: 'بانک رفاه کارگران' },
  { value: 'tosee-saderat', label: 'بانک توسعه صادرات' },
  { value: 'sanat-madan', label: 'بانک صنعت و معدن' },
  { value: 'keshavarzi', label: 'بانک کشاورزی' },
  { value: 'markazi', label: 'بانک مرکزی' },
  { value: 'post-bank', label: 'پست بانک ایران' },
  { value: 'tosee-taavon', label: 'بانک توسعه تعاون' },
  { value: 'eghtesad-novin', label: 'بانک اقتصاد نوین' },
  { value: 'parsian', label: 'بانک پارسیان' },
  { value: 'pasargad', label: 'بانک پاسارگاد' },
  { value: 'karafarin', label: 'بانک کارآفرین' },
  { value: 'saman', label: 'بانک سامان' },
  { value: 'sina', label: 'بانک سینا' },
  { value: 'sarmayeh', label: 'بانک سرمایه' },
  { value: 'shahr', label: 'بانک شهر' },
  { value: 'ayandeh', label: 'بانک آینده' },
];

export function BankAccountForm() {
  const router = useRouter();
  const { showToast } = useAppToast();
  const createMutation = useCreateBankAccount();
  const [formError, setFormError] = useState<string | null>(null);
  const currencyId = useDefaultCurrencyId();
  const [bankId, setBankId] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateBankAccountInput>({
    defaultValues: { isActive: true, openingBalance: { amount: '', date: '', description: '' } },
  });

  const onSubmit = async (data: CreateBankAccountInput) => {
    setFormError(null);
    try {
      // Strip empty opening balance (if either amount or date is missing)
      const payload = {
        ...data,
        currencyId: currencyId ?? '00000000-0000-0000-0000-000000000001',
        bankId: bankId || undefined,
      };
      if (!payload.openingBalance?.amount || !payload.openingBalance?.date) {
        delete payload.openingBalance;
      }
      if (!payload.bankId) {
        delete payload.bankId;
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
    <div className="flex flex-col animate-stagger">
      <DataPageHeader title={tr.newBankAccount} subtitle={tr.bankAccountSubtitle} />

      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {formError && <FormErrorBanner message={formError} />}

        <FormSection title={common.basicInfo}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField error={errors.code?.message}>
              <FormLabel>{tr.bankAccountCode}</FormLabel>
              <Input
                {...register('code', { required: true })}
                placeholder="BA-001"
                className="rounded-xl ltr-text"
                dir="ltr"
              />
            </FormField>
            <FormField error={errors.name?.message}>
              <FormLabel>{tr.bankAccountName}</FormLabel>
              <Input
                {...register('name', { required: true })}
                placeholder={tr.bankAccountName}
                className="rounded-xl"
              />
            </FormField>
            {/* bankId: uses static list until the banks API is available */}
            <FormField>
              <FormLabel>{tr.bankName}</FormLabel>
              <Select value={bankId} onValueChange={setBankId}>
                <SelectTrigger className="rounded-xl">
                  <span>{IRANIAN_BANKS.find((b) => b.value === bankId)?.label ?? tr.bankName}</span>
                </SelectTrigger>
                <SelectContent>
                  {IRANIAN_BANKS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField error={errors.branch?.message}>
              <FormLabel>{tr.branch}</FormLabel>
              <Input {...register('branch')} placeholder={tr.branch} className="rounded-xl" />
            </FormField>
            <FormField error={errors.accountNumber?.message}>
              <FormLabel>{tr.accountNumber}</FormLabel>
              <Input
                {...register('accountNumber', { required: true })}
                placeholder="0123456789"
                className="rounded-xl ltr-text"
                dir="ltr"
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
