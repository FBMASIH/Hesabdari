import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../../infrastructure/repositories/customer.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from '@hesabdari/contracts';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async findByOrganization(organizationId: string, query: CustomerQueryDto) {
    return this.customerRepository.findByOrganization(organizationId, {
      isActive: query.isActive,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async search(organizationId: string, q: string) {
    return this.customerRepository.search(organizationId, q);
  }

  async findById(id: string) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer', id);
    return customer;
  }

  async create(organizationId: string, data: CreateCustomerDto) {
    const existing = await this.customerRepository.findByCode(organizationId, data.code);
    if (existing) throw new ConflictError(`Customer with code ${data.code} already exists`);
    return this.customerRepository.create({
      organizationId,
      code: data.code,
      name: data.name,
      phone: data.phone ?? null,
      address: data.address ?? null,
      taxId: data.taxId ?? null,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, data: Omit<UpdateCustomerDto, 'id'>) {
    const customer = await this.findById(id);
    if (data.code) {
      const existing = await this.customerRepository.findByCode(customer.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Customer with code ${data.code} already exists`);
      }
    }
    return this.customerRepository.update(id, data);
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.customerRepository.update(id, { isActive: false });
  }
}
