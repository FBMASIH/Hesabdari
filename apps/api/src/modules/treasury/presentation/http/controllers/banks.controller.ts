import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankService } from '../../../application/services/bank.service';
import { createBankSchema, updateBankSchema } from '@hesabdari/contracts';

@ApiTags('Banks')
@ApiBearerAuth()
@Controller('banks')
export class BanksController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @ApiOperation({ summary: 'List all banks' })
  async list() {
    return this.bankService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a bank' })
  async create(@Body() body: unknown) {
    const data = createBankSchema.parse(body);
    return this.bankService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bank' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateBankSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.bankService.update(id, rest);
  }
}
