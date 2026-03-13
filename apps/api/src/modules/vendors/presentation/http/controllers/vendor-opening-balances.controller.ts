import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { VendorOpeningBalanceService } from '../../../application/services/vendor-opening-balance.service';
import {
  createVendorOpeningBalanceSchema,
  vendorOpeningBalanceQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Vendor Opening Balances')
@ApiBearerAuth()
@Controller('organizations/:orgId/vendors/opening-balances')
export class VendorOpeningBalancesController {
  constructor(private readonly service: VendorOpeningBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'List vendor opening balances' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = vendorOpeningBalanceQuerySchema.parse(query);
    return this.service.findByOrganization(orgId, parsed.vendorId);
  }

  @Post()
  @ApiOperation({ summary: 'Create vendor opening balance' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createVendorOpeningBalanceSchema.parse(body);
    return this.service.create(orgId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vendor opening balance' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.service.delete(id, orgId);
  }
}
