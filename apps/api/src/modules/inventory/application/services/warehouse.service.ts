import { Injectable } from '@nestjs/common';
import { WarehouseRepository } from '../../infrastructure/repositories/warehouse.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CostingMethod } from '@hesabdari/db';
import type {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseQueryDto,
} from '@hesabdari/contracts';

@Injectable()
export class WarehouseService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async findByOrganization(organizationId: string, query: WarehouseQueryDto) {
    return this.warehouseRepository.findByOrganization(organizationId, {
      isActive: query.isActive,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async findById(id: string, organizationId: string) {
    const warehouse = await this.warehouseRepository.findById(id, organizationId);
    if (!warehouse) throw new NotFoundError('Warehouse', id);
    return warehouse;
  }

  async create(organizationId: string, data: CreateWarehouseDto) {
    const existing = await this.warehouseRepository.findByCode(organizationId, data.code);
    if (existing) throw new ConflictError(`Warehouse with code ${data.code} already exists`);
    return this.warehouseRepository.create({
      organizationId,
      code: data.code,
      name: data.name,
      costingMethod: (data.costingMethod ?? 'FIFO') as CostingMethod,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdateWarehouseDto, 'id'>) {
    const warehouse = await this.findById(id, organizationId);
    if (data.code) {
      const existing = await this.warehouseRepository.findByCode(
        warehouse.organizationId,
        data.code,
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(`Warehouse with code ${data.code} already exists`);
      }
    }
    const { costingMethod, ...rest } = data;
    return this.warehouseRepository.update(id, {
      ...rest,
      ...(costingMethod ? { costingMethod: costingMethod as CostingMethod } : {}),
    });
  }
}
