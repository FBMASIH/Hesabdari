import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrencyRevaluationService } from '../../../application/services/currency-revaluation.service';
import { createRevaluationSchema, revaluationQuerySchema } from '@hesabdari/contracts';
import { CurrentUser, type RequestUser } from '@/platform/decorators';

@ApiTags('Currency Revaluation')
@ApiBearerAuth()
@Controller('organizations/:orgId/revaluations')
export class CurrencyRevaluationController {
  constructor(private readonly revaluationService: CurrencyRevaluationService) {}

  @Get()
  @ApiOperation({ summary: 'List currency revaluations' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown): Promise<unknown> {
    const parsed = revaluationQuerySchema.parse(query);
    return this.revaluationService.findAll(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get revaluation by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string): Promise<unknown> {
    return this.revaluationService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Run currency revaluation' })
  async revalue(
    @Param('orgId') orgId: string,
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ): Promise<unknown> {
    const data = createRevaluationSchema.parse(body);
    return this.revaluationService.revalue(orgId, data, user.userId);
  }

  @Post(':id/reverse')
  @ApiOperation({ summary: 'Reverse a posted revaluation' })
  async reverse(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<unknown> {
    return this.revaluationService.reverse(id, orgId, user.userId);
  }
}
