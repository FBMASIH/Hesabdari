import { ExchangeRateListPage } from '@/features/settings/components/exchange-rate-list-page';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { ExchangeRateDto } from '@/features/shared/hooks/use-exchange-rates';

export const dynamic = 'force-dynamic';

export default async function ExchangeRatesPage() {
  let initialData: { data: ExchangeRateDto[]; total: number } | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get<{ data: ExchangeRateDto[]; total: number }>(
      serverOrgPath(orgId, '/exchange-rates'),
      { page: '1', pageSize: '25', sortBy: 'date', sortOrder: 'desc' },
    );
  } catch {
    // Server fetch failed — client handles loading
  }

  return <ExchangeRateListPage initialData={initialData} />;
}
