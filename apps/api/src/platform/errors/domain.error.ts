// Re-export from the domain layer — DomainError belongs to the domain,
// but is re-exported here so existing platform consumers keep working.
export { DomainError } from '@/modules/accounting/domain/errors/domain.error';
