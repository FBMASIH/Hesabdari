import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductWarehouseStockRepository } from '../../infrastructure/repositories/product-warehouse-stock.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
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

  async findById(id: string) {
    const product = await this.productRepository.findById(id);
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
      salePrice: BigInt(data.salePrice ?? 0),
      costingMethod: data.costingMethod ?? 'FIFO',
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, data: Omit<UpdateProductDto, 'id'>) {
    const product = await this.findById(id);
    if (data.code) {
      const existing = await this.productRepository.findByCode(product.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Product with code ${data.code} already exists`);
      }
    }
    const updateData: any = { ...data };
    if (data.salePrice !== undefined) {
      updateData.salePrice = BigInt(data.salePrice);
    }
    return this.productRepository.update(id, updateData);
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.productRepository.update(id, { isActive: false });
  }

  // Warehouse stock methods
  async getWarehouseStocks(productId: string) {
    await this.findById(productId);
    return this.stockRepository.findByProduct(productId);
  }

  async upsertWarehouseStock(
    organizationId: string,
    productId: string,
    data: CreateProductWarehouseStockDto,
  ) {
    await this.findById(productId);
    return this.stockRepository.upsert({
      organizationId,
      productId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      purchasePrice: BigInt(data.purchasePrice),
      totalPrice: BigInt(data.totalPrice),
    });
  }

  async deleteWarehouseStock(stockId: string) {
    const stock = await this.stockRepository.findById(stockId);
    if (!stock) throw new NotFoundError('ProductWarehouseStock', stockId);
    return this.stockRepository.delete(stockId);
  }
}
