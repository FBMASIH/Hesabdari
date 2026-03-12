import { Injectable } from '@nestjs/common';
import { BankRepository } from '../../infrastructure/repositories/bank.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateBankDto, UpdateBankDto } from '@hesabdari/contracts';

@Injectable()
export class BankService {
  constructor(private readonly bankRepository: BankRepository) {}

  async findAll() {
    return this.bankRepository.findAll();
  }

  async findById(id: string) {
    const bank = await this.bankRepository.findById(id);
    if (!bank) throw new NotFoundError('Bank', id);
    return bank;
  }

  async create(data: CreateBankDto) {
    const existing = await this.bankRepository.findByCode(data.code);
    if (existing) throw new ConflictError(`Bank with code ${data.code} already exists`);
    return this.bankRepository.create(data);
  }

  async update(id: string, data: Omit<UpdateBankDto, 'id'>) {
    await this.findById(id);
    if (data.code) {
      const existing = await this.bankRepository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Bank with code ${data.code} already exists`);
      }
    }
    return this.bankRepository.update(id, data);
  }
}
