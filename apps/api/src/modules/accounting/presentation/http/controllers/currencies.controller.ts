import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrencyService } from '../../../application/services/currency.service';
import {
  createCurrencySchema,
  updateCurrencySchema,
  currencyQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Currencies')
@ApiBearerAuth()
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'List all currencies' })
  async list(@Query() query: unknown) {
    const parsed = currencyQuerySchema.parse(query);
    return this.currencyService.findAll(parsed.isActive);
  }

  @Post()
  @ApiOperation({ summary: 'Create a currency' })
  async create(@Body() body: unknown) {
    const data = createCurrencySchema.parse(body);
    return this.currencyService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a currency' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateCurrencySchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.currencyService.update(id, rest);
  }
}
