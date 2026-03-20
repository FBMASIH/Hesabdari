import { Injectable } from '@nestjs/common';
import { type CurrencyRepository } from '../../infrastructure/repositories/currency.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateCurrencyDto, UpdateCurrencyDto } from '@hesabdari/contracts';

@Injectable()
export class CurrencyService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async findAll(isActive?: boolean) {
    return this.currencyRepository.findAll(isActive);
  }

  async findById(id: string) {
    const currency = await this.currencyRepository.findById(id);
    if (!currency) throw new NotFoundError('Currency', id);
    return currency;
  }

  async create(data: CreateCurrencyDto) {
    const existing = await this.currencyRepository.findByCode(data.code);
    if (existing) throw new ConflictError(`Currency with code ${data.code} already exists`);
    return this.currencyRepository.create({
      code: data.code,
      name: data.name,
      symbol: data.symbol,
      decimalPlaces: data.decimalPlaces ?? 0,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, data: Omit<UpdateCurrencyDto, 'id'>) {
    await this.findById(id);
    if (data.code) {
      const existing = await this.currencyRepository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Currency with code ${data.code} already exists`);
      }
    }
    return this.currencyRepository.update(id, data);
  }
}
