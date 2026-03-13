import { Injectable } from '@nestjs/common';
import type { ExpenseRepository } from '../../infrastructure/repositories/expense.repository';
import { NotFoundError, ConflictError } from '@/platform/errors';
import type { CreateExpenseDto, UpdateExpenseDto } from '@hesabdari/contracts';

@Injectable()
export class ExpenseService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async findByOrganization(organizationId: string, isActive?: boolean) {
    return this.expenseRepository.findByOrganization(organizationId, isActive);
  }

  async findById(id: string, organizationId: string) {
    const expense = await this.expenseRepository.findById(id, organizationId);
    if (!expense) throw new NotFoundError('Expense', id);
    return expense;
  }

  async create(organizationId: string, data: CreateExpenseDto) {
    const existing = await this.expenseRepository.findByCode(organizationId, data.code);
    if (existing) throw new ConflictError(`Expense with code ${data.code} already exists`);
    return this.expenseRepository.create({
      organizationId,
      code: data.code,
      name: data.name,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdateExpenseDto, 'id'>) {
    const expense = await this.findById(id, organizationId);
    if (data.code) {
      const existing = await this.expenseRepository.findByCode(expense.organizationId, data.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Expense with code ${data.code} already exists`);
      }
    }
    return this.expenseRepository.update(id, data);
  }
}
