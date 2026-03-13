import { Injectable } from '@nestjs/common';
import type { CustomerRepository } from '../../infrastructure/repositories/customer.repository';
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

  async findById(id: string, organizationId: string) {
    const customer = await this.customerRepository.findById(id, organizationId);
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

  async update(id: string, organizationId: string, data: Omit<UpdateCustomerDto, 'id'>) {
    const customer = await this.findById(id, organizationId);
    if (data.code) {
      const existing = await this.customerRepository.findByCode(customer.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Customer with code ${data.code} already exists`);
      }
    }
    const { creditLimit, birthDate, ...rest } = data;
    return this.customerRepository.update(id, {
      ...rest,
      ...(creditLimit !== undefined ? { creditLimit: BigInt(creditLimit) } : {}),
      ...(birthDate !== undefined ? { birthDate: new Date(birthDate) } : {}),
    });
  }

  async softDelete(id: string, organizationId: string) {
    await this.findById(id, organizationId);
    return this.customerRepository.update(id, { isActive: false });
  }
}
