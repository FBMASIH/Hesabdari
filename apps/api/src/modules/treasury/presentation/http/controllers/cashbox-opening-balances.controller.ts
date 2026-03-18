import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CashboxOpeningBalanceService } from '../../../application/services/cashbox-opening-balance.service';
import {
  createCashboxOpeningBalanceSchema,
  cashboxOpeningBalanceQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Cashbox Opening Balances')
@ApiBearerAuth()
@Controller('organizations/:orgId/cashboxes/opening-balances')
export class CashboxOpeningBalancesController {
  constructor(private readonly service: CashboxOpeningBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'List cashbox opening balances' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = cashboxOpeningBalanceQuerySchema.parse(query);
    return this.service.findByOrganization(orgId, parsed.cashboxId);
  }

  @Post()
  @ApiOperation({ summary: 'Create cashbox opening balance' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createCashboxOpeningBalanceSchema.parse(body);
    return this.service.create(orgId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cashbox opening balance' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.service.delete(id, orgId);
  }
}
