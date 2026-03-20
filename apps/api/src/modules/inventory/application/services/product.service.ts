import { Injectable } from '@nestjs/common';
import type { ProductRepository } from '../../infrastructure/repositories/product.repository';
import type { ProductWarehouseStockRepository } from '../../infrastructure/repositories/product-warehouse-stock.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { Prisma } from '@hesabdari/db';
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  CreateProductWarehouseStockDto,
} from '@hesabdari/contracts';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly stockRepository: ProductWarehouseStockRepository,
  ) {}

  async findByOrganization(organizationId: string, query: ProductQueryDto) {
    return this.productRepository.findByOrganization(organizationId, {
      isActive: query.isActive,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async search(organizationId: string, q: string) {
    return this.productRepository.search(organizationId, q);
  }

  async findById(id: string, organizationId: string) {
    const product = await this.productRepository.findById(id, organizationId);
    if (!product) throw new NotFoundError('Product', id);
    return product;
  }

  async create(organizationId: string, data: CreateProductDto) {
    const existing = await this.productRepository.findByCode(organizationId, data.code);
    if (existing) throw new ConflictError(`Product with code ${data.code} already exists`);
    return this.productRepository.create({
      organizationId,
      code: data.code,
      name: data.name,
      barcode: data.barcode ?? null,
      countingUnit: data.countingUnit ?? 'عدد',
      majorUnit: data.majorUnit ?? null,
      minorUnit: data.minorUnit ?? null,
      quantityInMajorUnit: data.quantityInMajorUnit ?? null,
      salePrice1: BigInt(data.salePrice1 ?? '0'),
      salePrice2: BigInt(data.salePrice2 ?? '0'),
      salePrice3: BigInt(data.salePrice3 ?? '0'),
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdateProductDto, 'id'>) {
    const product = await this.findById(id, organizationId);
    if (data.code) {
      const existing = await this.productRepository.findByCode(product.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Product with code ${data.code} already exists`);
      }
    }
    const { salePrice1, salePrice2, salePrice3, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (salePrice1 !== undefined) updateData.salePrice1 = BigInt(salePrice1);
    if (salePrice2 !== undefined) updateData.salePrice2 = BigInt(salePrice2);
    if (salePrice3 !== undefined) updateData.salePrice3 = BigInt(salePrice3);
    return this.productRepository.update(id, updateData as Prisma.ProductUpdateInput);
  }

  async softDelete(id: string, organizationId: string) {
    await this.findById(id, organizationId);
    return this.productRepository.update(id, { isActive: false });
  }

  // Warehouse stock methods
  async getWarehouseStocks(productId: string, organizationId: string) {
    await this.findById(productId, organizationId);
    return this.stockRepository.findByProduct(productId, organizationId);
  }

  async upsertWarehouseStock(
    organizationId: string,
    productId: string,
    data: CreateProductWarehouseStockDto,
  ) {
    await this.findById(productId, organizationId);
    return this.stockRepository.upsert({
      organizationId,
      productId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      purchasePrice: BigInt(data.purchasePrice),
      totalPrice: BigInt(data.totalPrice),
    });
  }

  async deleteWarehouseStock(stockId: string, organizationId: string) {
    const stock = await this.stockRepository.findById(stockId, organizationId);
    if (!stock) throw new NotFoundError('ProductWarehouseStock', stockId);
    return this.stockRepository.delete(stockId);
  }
}
