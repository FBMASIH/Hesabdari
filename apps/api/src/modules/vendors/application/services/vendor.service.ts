import { Injectable } from '@nestjs/common';
import { type VendorRepository } from '../../infrastructure/repositories/vendor.repository';
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

  async findById(id: string, organizationId: string) {
    const vendor = await this.vendorRepository.findById(id, organizationId);
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
      referrer: data.referrer ?? null,
      title: data.title ?? null,
      phone1: data.phone1 ?? null,
      phone2: data.phone2 ?? null,
      phone3: data.phone3 ?? null,
      address: data.address ?? null,
      creditLimit: data.creditLimit ? BigInt(data.creditLimit) : BigInt(0),
      nationalId: data.nationalId ?? null,
      economicCode: data.economicCode ?? null,
      postalCode: data.postalCode ?? null,
      bankAccount1: data.bankAccount1 ?? null,
      bankAccount2: data.bankAccount2 ?? null,
      bankAccount3: data.bankAccount3 ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdateVendorDto, 'id'>) {
    const vendor = await this.findById(id, organizationId);
    if (data.code) {
      const existing = await this.vendorRepository.findByCode(vendor.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Vendor with code ${data.code} already exists`);
      }
    }
    const { creditLimit, birthDate, ...rest } = data;
    return this.vendorRepository.update(id, {
      ...rest,
      ...(creditLimit !== undefined ? { creditLimit: BigInt(creditLimit) } : {}),
      ...(birthDate !== undefined ? { birthDate: new Date(birthDate) } : {}),
    });
  }

  async softDelete(id: string, organizationId: string) {
    await this.findById(id, organizationId);
    return this.vendorRepository.update(id, { isActive: false });
  }
}
