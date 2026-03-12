import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../../infrastructure/repositories/vendor.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateVendorDto, UpdateVendorDto, VendorQueryDto } from '@hesabdari/contracts';

@Injectable()
export class VendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async findByOrganization(organizationId: string, query: VendorQueryDto) {
    return this.vendorRepository.findByOrganization(organizationId, {
      isActive: query.isActive,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async search(organizationId: string, q: string) {
    return this.vendorRepository.search(organizationId, q);
  }

  async findById(id: string) {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError('Vendor', id);
    return vendor;
  }

  async create(organizationId: string, data: CreateVendorDto) {
    const existing = await this.vendorRepository.findByCode(organizationId, data.code);
    if (existing) throw new ConflictError(`Vendor with code ${data.code} already exists`);
    return this.vendorRepository.create({
      organizationId,
      code: data.code,
      name: data.name,
      phone: data.phone ?? null,
      address: data.address ?? null,
      taxId: data.taxId ?? null,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, data: Omit<UpdateVendorDto, 'id'>) {
    const vendor = await this.findById(id);
    if (data.code) {
      const existing = await this.vendorRepository.findByCode(vendor.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Vendor with code ${data.code} already exists`);
      }
    }
    return this.vendorRepository.update(id, data);
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.vendorRepository.update(id, { isActive: false });
  }
}
