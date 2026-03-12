import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from '../../../application/services/customer.service';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
  customerSearchSchema,
} from '@hesabdari/contracts';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('organizations/:orgId/customers')
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List customers (paginated)' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = customerQuerySchema.parse(query);
    return this.customerService.findByOrganization(orgId, parsed);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by code/name' })
  async search(@Param('orgId') orgId: string, @Query() query: unknown) {
    const { q } = customerSearchSchema.parse(query);
    return this.customerService.search(orgId, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findById(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createCustomerSchema.parse(body);
    return this.customerService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a customer' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateCustomerSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.customerService.update(id, rest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a customer' })
  async remove(@Param('id') id: string) {
    return this.customerService.softDelete(id);
  }
}
