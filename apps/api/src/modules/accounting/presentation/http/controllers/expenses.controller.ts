import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpenseService } from '../../../application/services/expense.service';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from '@hesabdari/contracts';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('organizations/:orgId/expenses')
export class ExpensesController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @ApiOperation({ summary: 'List expenses' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = expenseQuerySchema.parse(query);
    return this.expenseService.findByOrganization(orgId, parsed.isActive);
  }

  @Post()
  @ApiOperation({ summary: 'Create an expense' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createExpenseSchema.parse(body);
    return this.expenseService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateExpenseSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.expenseService.update(id, rest);
  }
}
