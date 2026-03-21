'use client';

import { useState } from 'react';
import {
  useExchangeRates,
  useSyncExchangeRates,
  useDeleteExchangeRate,
  type ExchangeRateDto,
} from '@/features/shared/hooks/use-exchange-rates';
import { toPersianDigits } from '@/shared/lib/date';
import { t } from '@/shared/lib/i18n';

const common = t('common');

interface ExchangeRateListPageProps {
  initialData?: { data: ExchangeRateDto[]; total: number };
}

export function ExchangeRateListPage({ initialData }: ExchangeRateListPageProps) {
  const { data, isLoading } = useExchangeRates(undefined, initialData);
  const syncMutation = useSyncExchangeRates();
  const deleteMutation = useDeleteExchangeRate();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const rates = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-fg-primary">{common.exchangeRates}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="rounded-md bg-bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-bg-accent/90 disabled:opacity-50"
          >
            {syncMutation.isPending ? '...' : common.syncRates}
          </button>
        </div>
      </div>

      {syncMutation.isSuccess && (
        <div className="rounded-md bg-bg-success/10 p-3 text-sm text-fg-success">
          {toPersianDigits(String(syncMutation.data?.synced ?? 0))} نرخ دریافت شد
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border-primary">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-primary bg-bg-secondary">
              <th className="px-4 py-3 text-start font-medium text-fg-secondary">
                {common.fromCurrency}
              </th>
              <th className="px-4 py-3 text-start font-medium text-fg-secondary">
                {common.toCurrency}
              </th>
              <th className="px-4 py-3 text-start font-medium text-fg-secondary">{common.rate}</th>
              <th className="px-4 py-3 text-start font-medium text-fg-secondary">{common.date}</th>
              <th className="px-4 py-3 text-start font-medium text-fg-secondary">
                {common.source}
              </th>
              <th className="px-4 py-3 text-start font-medium text-fg-secondary">
                {common.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && !initialData ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-tertiary">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-tertiary">
                  نرخی ثبت نشده است
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={rate.id} className="border-b border-border-primary last:border-b-0">
                  <td className="px-4 py-3">{rate.fromCurrency.code}</td>
                  <td className="px-4 py-3">{rate.toCurrency.code}</td>
                  <td className="px-4 py-3 font-mono ltr-text" dir="ltr">
                    {toPersianDigits(String(rate.rate))}
                  </td>
                  <td className="px-4 py-3">{toPersianDigits(rate.date)}</td>
                  <td className="px-4 py-3">
                    {rate.source === 'MANUAL' ? common.manual : common.online}
                  </td>
                  <td className="px-4 py-3">
                    {rate.source === 'MANUAL' && (
                      <>
                        {deleteConfirmId === rate.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                deleteMutation.mutate(rate.id);
                                setDeleteConfirmId(null);
                              }}
                              className="text-xs text-fg-danger hover:underline"
                            >
                              {common.confirm}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs text-fg-tertiary hover:underline"
                            >
                              {common.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(rate.id)}
                            className="text-xs text-fg-danger hover:underline"
                          >
                            {common.delete}
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
