import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from '../../../application/services/invoice.service';
import { createInvoiceSchema, updateInvoiceSchema, invoiceQuerySchema } from '@hesabdari/contracts';
import { CurrentUser, type RequestUser } from '@/platform/decorators';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('organizations/:orgId/invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices (paginated, filterable by type/status)' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = invoiceQuerySchema.parse(query);
    return this.invoiceService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice with lines' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.invoiceService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create invoice with lines (transactional)' })
  async create(
    @Param('orgId') orgId: string,
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ) {
    const data = createInvoiceSchema.parse(body);
    return this.invoiceService.create(orgId, data, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice with lines (transactional, DRAFT only)' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateInvoiceSchema.parse({ ...(body as object), id });
    return this.invoiceService.update(id, orgId, data);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm invoice (DRAFT → CONFIRMED)' })
  async confirm(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.invoiceService.confirm(id, orgId, user.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel invoice' })
  async cancel(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.invoiceService.cancel(id, orgId, user.userId);
  }
}
