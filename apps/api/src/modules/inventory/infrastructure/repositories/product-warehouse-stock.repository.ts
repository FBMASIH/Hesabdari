import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/database/prisma.service';

@Injectable()
export class ProductWarehouseStockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: string) {
    return this.prisma.productWarehouseStock.findMany({
      where: { productId },
      include: { warehouse: true },
      orderBy: { warehouse: { code: 'asc' } },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.productWarehouseStock.findFirst({
      where: { id, organizationId },
      include: { warehouse: true },
    });
  }

  async findByProductAndWarehouse(productId: string, warehouseId: string) {
    return this.prisma.productWarehouseStock.findFirst({
      where: { productId, warehouseId },
    });
  }

  async upsert(data: {
    organizationId: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    purchasePrice: bigint;
    totalPrice: bigint;
  }) {
    const existing = await this.findByProductAndWarehouse(data.productId, data.warehouseId);
    if (existing) {
      return this.prisma.productWarehouseStock.update({
        where: { id: existing.id },
        data: {
          quantity: data.quantity,
          purchasePrice: data.purchasePrice,
          totalPrice: data.totalPrice,
        },
      });
    }
    return this.prisma.productWarehouseStock.create({ data });
  }

  async delete(id: string) {
    return this.prisma.productWarehouseStock.delete({ where: { id } });
  }
}
