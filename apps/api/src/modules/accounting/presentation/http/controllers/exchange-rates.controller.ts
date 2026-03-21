import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeRateService } from '../../../application/services/exchange-rate.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import {
  createExchangeRateSchema,
  updateExchangeRateSchema,
  exchangeRateQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Exchange Rates')
@ApiBearerAuth()
@Controller('organizations/:orgId/exchange-rates')
export class ExchangeRatesController {
  constructor(
    private readonly exchangeRateService: ExchangeRateService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List exchange rates' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown): Promise<unknown> {
    const parsed = exchangeRateQuerySchema.parse(query);
    return this.exchangeRateService.findAll(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exchange rate by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string): Promise<unknown> {
    return this.exchangeRateService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create manual exchange rate' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown): Promise<unknown> {
    const data = createExchangeRateSchema.parse(body);
    return this.exchangeRateService.createManual(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update manual exchange rate' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown): Promise<unknown> {
    const data = updateExchangeRateSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.exchangeRateService.updateManual(id, orgId, rest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete manual exchange rate' })
  async delete(@Param('orgId') orgId: string, @Param('id') id: string): Promise<{ success: boolean }> {
    await this.exchangeRateService.deleteManual(id, orgId);
    return { success: true };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync exchange rates from external API' })
  async sync(@Param('orgId') orgId: string): Promise<unknown> {
    const org = await this.organizationService.findById(orgId);
    const defaultCurrency = (org as Record<string, unknown>).defaultCurrency as {
      id: string;
      code: string;
    };
    return this.exchangeRateService.syncFromApi(orgId, defaultCurrency.code, defaultCurrency.id);
  }
}
