import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from '../../infrastructure/repositories/invoice.repository';
import { NotFoundError, ConflictError, ApplicationError } from '@/platform/errors';
import type { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from '@hesabdari/contracts';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  CANCELLED: [],
};

@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async findByOrganization(organizationId: string, query: InvoiceQueryDto) {
    return this.invoiceRepository.findByOrganization(organizationId, {
      type: query.type,
      status: query.status,
      customerId: query.customerId,
      vendorId: query.vendorId,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async findById(id: string, organizationId: string) {
    const invoice = await this.invoiceRepository.findById(id, organizationId);
    if (!invoice) throw new NotFoundError('Invoice', id);
    return invoice;
  }

  async create(organizationId: string, data: CreateInvoiceDto) {
    // Check invoice number uniqueness per org+type
    const existing = await this.invoiceRepository.findByNumber(
      organizationId,
      data.documentType,
      data.invoiceNumber,
    );
    if (existing) {
      throw new ConflictError(
        `Invoice number ${data.invoiceNumber} already exists for type ${data.documentType}`,
      );
    }

    // Compute line totals and invoice total
    const lines = data.lines.map((line) => ({
      productId: line.productId,
      warehouseId: line.warehouseId ?? null,
      description: line.description ?? null,
      quantity: line.quantity,
      unitPrice: BigInt(line.unitPrice),
      discount: BigInt(line.discount ?? 0),
      tax: BigInt(line.tax ?? 0),
      totalPrice: BigInt(line.totalPrice),
    }));

    const totalAmount = lines.reduce((sum, l) => sum + l.totalPrice, 0n);

    return this.invoiceRepository.createWithLines({
      organizationId,
      documentType: data.documentType,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate ?? null,
      description: data.description ?? null,
      customerId: 'customerId' in data ? (data.customerId as string) : null,
      vendorId: 'vendorId' in data ? (data.vendorId as string) : null,
      currencyId: data.currencyId,
      totalAmount,
      lines,
    });
  }

  async update(id: string, organizationId: string, data: UpdateInvoiceDto) {
    const invoice = await this.findById(id, organizationId);
    if (invoice.status !== 'DRAFT') {
      throw new ApplicationError(
        'INVALID_STATUS',
        'Cannot modify a non-DRAFT invoice. Cancel and re-create instead.',
      );
    }

    let totalAmount: bigint | undefined;
    let mappedLines:
      | Array<{
          productId: string;
          warehouseId: string | null;
          description: string | null;
          quantity: number;
          unitPrice: bigint;
          discount: bigint;
          tax: bigint;
          totalPrice: bigint;
        }>
      | undefined;

    if (data.lines) {
      mappedLines = data.lines.map((line) => ({
        productId: line.productId,
        warehouseId: line.warehouseId ?? null,
        description: line.description ?? null,
        quantity: line.quantity,
        unitPrice: BigInt(line.unitPrice),
        discount: BigInt(line.discount ?? 0),
        tax: BigInt(line.tax ?? 0),
        totalPrice: BigInt(line.totalPrice),
      }));
      totalAmount = mappedLines.reduce((sum, l) => sum + l.totalPrice, 0n);
    }

    return this.invoiceRepository.updateWithLines(
      id,
      invoice.organizationId,
      {
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        description: data.description,
        totalAmount,
      },
      mappedLines,
    );
  }

  async confirm(id: string, organizationId: string) {
    const invoice = await this.findById(id, organizationId);
    this.validateTransition(invoice.status, 'CONFIRMED');
    await this.invoiceRepository.updateStatus(id, 'CONFIRMED');
    return this.findById(id, organizationId);
  }

  async cancel(id: string, organizationId: string) {
    const invoice = await this.findById(id, organizationId);
    this.validateTransition(invoice.status, 'CANCELLED');
    await this.invoiceRepository.updateStatus(id, 'CANCELLED');
    return this.findById(id, organizationId);
  }

  private validateTransition(currentStatus: string, targetStatus: string) {
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new ApplicationError(
        'INVALID_TRANSITION',
        `Cannot transition from ${currentStatus} to ${targetStatus}`,
      );
    }
  }
}
