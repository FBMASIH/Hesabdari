import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { WarehouseService } from '../../../application/services/warehouse.service';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Warehouses')
@ApiBearerAuth()
@Controller('organizations/:orgId/warehouses')
export class WarehousesController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @ApiOperation({ summary: 'List warehouses' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = warehouseQuerySchema.parse(query);
    return this.warehouseService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.warehouseService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a warehouse' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createWarehouseSchema.parse(body);
    return this.warehouseService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a warehouse' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateWarehouseSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.warehouseService.update(id, orgId, rest);
  }
}
