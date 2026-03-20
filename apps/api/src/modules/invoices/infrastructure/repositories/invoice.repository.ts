import { Injectable } from '@nestjs/common';
import type { PrismaService } from '@/platform/database/prisma.service';
import type { Prisma } from '@hesabdari/db';
import type { DocumentType, InvoiceStatus } from '@hesabdari/db';

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrganization(
    organizationId: string,
    opts: {
      type?: string;
      status?: string;
      customerId?: string;
      vendorId?: string;
      fromDate?: Date;
      toDate?: Date;
      page: number;
      pageSize: number;
    },
  ) {
    const where: Prisma.InvoiceWhereInput = { organizationId };
    if (opts.type) where.documentType = opts.type as DocumentType;
    if (opts.status) where.status = opts.status as InvoiceStatus;
    if (opts.customerId) where.customerId = opts.customerId;
    if (opts.vendorId) where.vendorId = opts.vendorId;
    if (opts.fromDate || opts.toDate) {
      where.invoiceDate = {
        ...(opts.fromDate ? { gte: opts.fromDate } : {}),
        ...(opts.toDate ? { lte: opts.toDate } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: { customer: true, vendor: true, currency: true },
        orderBy: { invoiceDate: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, total, page: opts.page, pageSize: opts.pageSize };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        lines: { include: { product: true, warehouse: true }, orderBy: { createdAt: 'asc' } },
        customer: true,
        vendor: true,
        currency: true,
      },
    });
  }

  async findByNumber(organizationId: string, documentType: string, invoiceNumber: string) {
    return this.prisma.invoice.findFirst({
      where: { organizationId, documentType: documentType as DocumentType, invoiceNumber },
    });
  }

  async createWithLines(data: {
    organizationId: string;
    documentType: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate?: Date | null;
    description?: string | null;
    customerId?: string | null;
    vendorId?: string | null;
    currencyId: string;
    totalAmount: bigint;
    lines: Array<{
      productId: string;
      warehouseId?: string | null;
      description?: string | null;
      quantity: number;
      unitPrice: bigint;
      discount: bigint;
      tax: bigint;
      totalPrice: bigint;
    }>;
  }) {
    const { lines, ...invoiceData } = data;
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          documentType: invoiceData.documentType as DocumentType,
          status: 'DRAFT' as InvoiceStatus,
        },
      });
      await tx.invoiceLine.createMany({
        data: lines.map((line, index) => ({
          ...line,
          invoiceId: invoice.id,
          lineNumber: index + 1,
        })),
      });
      return this.findById(invoice.id, data.organizationId);
    });
  }

  async updateWithLines(
    id: string,
    organizationId: string,
    data: {
      invoiceDate?: Date;
      dueDate?: Date | null;
      description?: string | null;
      totalAmount?: bigint;
    },
    lines?: Array<{
      productId: string;
      warehouseId?: string | null;
      description?: string | null;
      quantity: number;
      unitPrice: bigint;
      discount: bigint;
      tax: bigint;
      totalPrice: bigint;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Verify ownership before mutation
      const existing = await tx.invoice.findFirst({ where: { id, organizationId } });
      if (!existing) return null;

      await tx.invoice.update({ where: { id }, data });
      if (lines) {
        await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
        await tx.invoiceLine.createMany({
          data: lines.map((line, index) => ({
            ...line,
            invoiceId: id,
            lineNumber: index + 1,
          })),
        });
      }
      return this.findById(id, organizationId);
    });
  }

  async updateStatus(id: string, organizationId: string, status: string) {
    // Scope update by organizationId — updateMany accepts non-unique where
    const result = await this.prisma.invoice.updateMany({
      where: { id, organizationId },
      data: { status: status as InvoiceStatus },
    });
    return result;
  }
}
