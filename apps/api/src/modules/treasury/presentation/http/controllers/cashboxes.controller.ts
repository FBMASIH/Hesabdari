import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { CashboxService } from '../../../application/services/cashbox.service';
import { createCashboxSchema, updateCashboxSchema, cashboxQuerySchema } from '@hesabdari/contracts';

@ApiTags('Cashboxes')
@ApiBearerAuth()
@Controller('organizations/:orgId/cashboxes')
export class CashboxesController {
  constructor(private readonly cashboxService: CashboxService) {}

  @Get()
  @ApiOperation({ summary: 'List cashboxes' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = cashboxQuerySchema.parse(query);
    return this.cashboxService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cashbox by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.cashboxService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a cashbox' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createCashboxSchema.parse(body);
    return this.cashboxService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a cashbox' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateCashboxSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.cashboxService.update(id, orgId, rest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a cashbox' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.cashboxService.softDelete(id, orgId);
  }
}
