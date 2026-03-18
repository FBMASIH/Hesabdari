import { Injectable } from '@nestjs/common';
import { ReceivedChequeRepository } from '../../infrastructure/repositories/received-cheque.repository';
import { BankAccountRepository } from '../../infrastructure/repositories/bank-account.repository';
import { NotFoundError, ConflictError, ApplicationError } from '@/platform/errors';
import type { Prisma } from '@hesabdari/db';
import type {
  CreateReceivedChequeDto,
  UpdateReceivedChequeDto,
  ReceivedChequeStatusDto,
  ReceivedChequeQueryDto,
} from '@hesabdari/contracts';

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['DEPOSITED', 'CANCELLED'],
  DEPOSITED: ['CASHED', 'RETURNED', 'BOUNCED', 'CANCELLED'],
  CASHED: [],
  RETURNED: ['OPEN', 'CANCELLED'],
  BOUNCED: [],
  CANCELLED: [],
};

@Injectable()
export class ReceivedChequeService {
  constructor(
    private readonly chequeRepository: ReceivedChequeRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async findByOrganization(organizationId: string, query: ReceivedChequeQueryDto) {
    return this.chequeRepository.findByOrganization(organizationId, {
      status: query.status,
      customerId: query.customerId,
      fromDueDate: query.fromDueDate,
      toDueDate: query.toDueDate,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });
  }

  async findById(id: string, organizationId: string) {
    const cheque = await this.chequeRepository.findById(id, organizationId);
    if (!cheque) throw new NotFoundError('ReceivedCheque', id);
    return cheque;
  }

  async create(organizationId: string, data: CreateReceivedChequeDto) {
    if (data.sayadiNumber) {
      const existing = await this.chequeRepository.findBySayadiNumber(
        organizationId,
        data.sayadiNumber,
      );
      if (existing) {
        throw new ConflictError(
          `Received cheque with sayadi number ${data.sayadiNumber} already exists`,
        );
      }
    }

    return this.chequeRepository.create({
      organizationId,
      customerId: data.customerId,
      currencyId: data.currencyId,
      chequeNumber: data.chequeNumber,
      amount: BigInt(data.amount),
      date: data.date,
      dueDate: data.dueDate,
      sayadiNumber: data.sayadiNumber ?? null,
      description: data.description ?? null,
    });
  }

  async update(id: string, organizationId: string, data: Omit<UpdateReceivedChequeDto, 'id'>) {
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
          `Received cheque with sayadi number ${data.sayadiNumber} already exists`,
        );
      }
    }

    const { amount, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (amount !== undefined) updateData.amount = BigInt(amount);
    return this.chequeRepository.update(id, updateData as Prisma.ReceivedChequeUpdateInput);
  }

  async changeStatus(id: string, organizationId: string, data: ReceivedChequeStatusDto) {
    const cheque = await this.findById(id, organizationId);
    const allowed = VALID_TRANSITIONS[cheque.status] ?? [];
    if (!allowed.includes(data.status)) {
      throw new ApplicationError(
        'INVALID_TRANSITION',
        `Cannot transition from ${cheque.status} to ${data.status}`,
      );
    }

    if (data.status === 'DEPOSITED' && data.depositBankAccountId) {
      const bankAccount = await this.bankAccountRepository.findById(
        data.depositBankAccountId,
        organizationId,
      );
      if (!bankAccount) {
        throw new NotFoundError('BankAccount', data.depositBankAccountId);
      }
      if (bankAccount.currencyId !== cheque.currencyId) {
        throw new ApplicationError(
          'CURRENCY_MISMATCH',
          'Deposit bank account currency must match cheque currency',
        );
      }
    }

    return this.chequeRepository.updateStatus(
      id,
      data.status,
      data.status === 'DEPOSITED' ? data.depositBankAccountId : undefined,
    );
  }
}
