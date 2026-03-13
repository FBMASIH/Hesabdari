export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface InvoiceEntity {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  customerId: string;
  totalAmount: bigint;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
