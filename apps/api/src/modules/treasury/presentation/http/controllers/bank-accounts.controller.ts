import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { BankAccountService } from '../../../application/services/bank-account.service';
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@Controller('organizations/:orgId/bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Get()
  @ApiOperation({ summary: 'List bank accounts' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = bankAccountQuerySchema.parse(query);
    return this.bankAccountService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank account by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.bankAccountService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a bank account' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createBankAccountSchema.parse(body);
    return this.bankAccountService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bank account' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateBankAccountSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.bankAccountService.update(id, orgId, rest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a bank account' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.bankAccountService.softDelete(id, orgId);
  }
}
