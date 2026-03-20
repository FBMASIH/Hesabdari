import { Injectable } from '@nestjs/common';
import { type PaidChequeRepository } from '../../infrastructure/repositories/paid-cheque.repository';
import { type BankAccountRepository } from '../../infrastructure/repositories/bank-account.repository';
import { NotFoundError, ConflictError, ApplicationError } from '@/platform/errors';
import type { Prisma } from '@hesabdari/db';
import type {
  CreatePaidChequeDto,
  UpdatePaidChequeDto,
  PaidChequeStatusDto,
  PaidChequeQueryDto,
} from '@hesabdari/contracts';

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['CLEARED', 'RETURNED', 'CANCELLED'],
  CLEARED: [],
  RETURNED: ['OPEN', 'CANCELLED'],
  CANCELLED: [],
};

@Injectable()
export class PaidChequeService {
  constructor(
    private readonly chequeRepository: PaidChequeRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async findByOrganization(organizationId: string, query: PaidChequeQueryDto) {
    return this.chequeRepository.findByOrganization(organizationId, {
      status: query.status,
      vendorId: query.vendorId,
      bankAccountId: query.bankAccountId,
      fromDueDate: query.fromDueDate,
      toDueDate: query.toDueDate,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async findById(id: string, organizationId: string) {
    const cheque = await this.chequeRepository.findById(id, organizationId);
    if (!cheque) throw new NotFoundError('PaidCheque', id);
    return cheque;
  }

  async create(organizationId: string, data: CreatePaidChequeDto) {
    if (data.sayadiNumber) {
      const existing = await this.chequeRepository.findBySayadiNumber(
        organizationId,
        data.sayadiNumber,
      );
      if (existing) {
        throw new ConflictError(
          `Paid cheque with sayadi number ${data.sayadiNumber} already exists`,
        );
      }
    }

    const bankAccount = await this.bankAccountRepository.findById(
      data.bankAccountId,
      organizationId,
    );
    if (!bankAccount) throw new NotFoundError('BankAccount', data.bankAccountId);
    if (bankAccount.currencyId !== data.currencyId) {
      throw new ApplicationError(
        'CURRENCY_MISMATCH',
        'Paid cheque currency must match the bank account currency',
      );
    }

    return this.chequeRepository.create({
      organizationId,
      vendorId: data.vendorId ?? null,
      bankAccountId: data.bankAccountId,
      currencyId: data.currencyId,
      chequeNumber: data.chequeNumber,
      amount: BigInt(data.amount),
      date: data.date,
      dueDate: data.dueDate,
      sayadiNumber: data.sayadiNumber ?? null,
      description: data.description ?? null,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdatePaidChequeDto, 'id'>) {
    const cheque = await this.findById(id, organizationId);
    if (cheque.status !== 'OPEN') {
      throw new ApplicationError('INVALID_STATUS', 'Can only update cheques in OPEN status');
    }

    if (data.sayadiNumber && data.sayadiNumber !== cheque.sayadiNumber) {
      const existing = await this.chequeRepository.findBySayadiNumber(
        cheque.organizationId,
        data.sayadiNumber,
      );
      if (existing) {
        throw new ConflictError(
          `Paid cheque with sayadi number ${data.sayadiNumber} already exists`,
        );
      }
    }

    const { amount, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (amount !== undefined) updateData.amount = BigInt(amount);
    return this.chequeRepository.update(
      id,
      organizationId,
      updateData as Prisma.PaidChequeUncheckedUpdateInput,
    );
  }

  async changeStatus(id: string, organizationId: string, data: PaidChequeStatusDto) {
    const cheque = await this.findById(id, organizationId);
    const allowed = VALID_TRANSITIONS[cheque.status] ?? [];
    if (!allowed.includes(data.status)) {
      throw new ApplicationError(
        'INVALID_TRANSITION',
        `Cannot transition from ${cheque.status} to ${data.status}`,
      );
    }
    return this.chequeRepository.updateStatus(id, organizationId, data.status);
  }
}
