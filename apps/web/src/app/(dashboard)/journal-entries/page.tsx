import { ErrorBoundary } from '@hesabdari/ui';
import { JournalEntryListPage } from '@/features/journal';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { JournalEntryDto } from '@/features/journal';

export default async function JournalEntriesPage() {
  let initialData: PaginatedResponse<JournalEntryDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/journal-entries'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <JournalEntryListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
