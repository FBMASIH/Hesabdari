import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { VendorService } from '../../../application/services/vendor.service';
import {
  createVendorSchema,
  updateVendorSchema,
  vendorQuerySchema,
  vendorSearchSchema,
} from '@hesabdari/contracts';

@ApiTags('Vendors')
@ApiBearerAuth()
@Controller('organizations/:orgId/vendors')
export class VendorsController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'List vendors (paginated)' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = vendorQuerySchema.parse(query);
    return this.vendorService.findByOrganization(orgId, parsed);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search vendors by code/name' })
  async search(@Param('orgId') orgId: string, @Query() query: unknown) {
    const { q } = vendorSearchSchema.parse(query);
    return this.vendorService.search(orgId, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.vendorService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a vendor' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createVendorSchema.parse(body);
    return this.vendorService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateVendorSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.vendorService.update(id, orgId, rest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a vendor' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.vendorService.softDelete(id, orgId);
  }
}
