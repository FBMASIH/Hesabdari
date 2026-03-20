export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export type DocumentType = 'SALES' | 'PURCHASE' | 'SALES_RETURN' | 'PURCHASE_RETURN' | 'PROFORMA';

export interface InvoiceEntity {
  id: string;
  organizationId: string;
  documentType: DocumentType;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date | null;
  customerId: string | null;
  vendorId: string | null;
  currencyId: string;
  totalAmount: bigint;
  description: string | null;
  status: InvoiceStatus;
  journalEntryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
