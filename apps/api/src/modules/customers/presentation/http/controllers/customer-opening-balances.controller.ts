import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerOpeningBalanceService } from '../../../application/services/customer-opening-balance.service';
import {
  createCustomerOpeningBalanceSchema,
  customerOpeningBalanceQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Customer Opening Balances')
@ApiBearerAuth()
@Controller('organizations/:orgId/customers/opening-balances')
export class CustomerOpeningBalancesController {
  constructor(private readonly service: CustomerOpeningBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'List customer opening balances' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = customerOpeningBalanceQuerySchema.parse(query);
    return this.service.findByOrganization(orgId, parsed.customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer opening balance' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createCustomerOpeningBalanceSchema.parse(body);
    return this.service.create(orgId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer opening balance' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.service.delete(id, orgId);
  }
}
