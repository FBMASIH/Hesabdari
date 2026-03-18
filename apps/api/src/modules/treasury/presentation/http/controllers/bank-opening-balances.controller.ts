import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankOpeningBalanceService } from '../../../application/services/bank-opening-balance.service';
import {
  createBankOpeningBalanceSchema,
  bankOpeningBalanceQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Bank Opening Balances')
@ApiBearerAuth()
@Controller('organizations/:orgId/bank-accounts/opening-balances')
export class BankOpeningBalancesController {
  constructor(private readonly service: BankOpeningBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'List bank opening balances' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = bankOpeningBalanceQuerySchema.parse(query);
    return this.service.findByOrganization(orgId, parsed.bankAccountId);
  }

  @Post()
  @ApiOperation({ summary: 'Create bank opening balance' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createBankOpeningBalanceSchema.parse(body);
    return this.service.create(orgId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bank opening balance' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.service.delete(id, orgId);
  }
}
