import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { type PaidChequeService } from '../../../application/services/paid-cheque.service';
import {
  createPaidChequeSchema,
  updatePaidChequeSchema,
  paidChequeStatusSchema,
  paidChequeQuerySchema,
} from '@hesabdari/contracts';
import { CurrentUser, type RequestUser } from '@/platform/decorators';

@ApiTags('Paid Cheques')
@ApiBearerAuth()
@Controller('organizations/:orgId/paid-cheques')
export class PaidChequesController {
  constructor(private readonly chequeService: PaidChequeService) {}

  @Get()
  @ApiOperation({ summary: 'List paid cheques' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = paidChequeQuerySchema.parse(query);
    return this.chequeService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get paid cheque by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.chequeService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a paid cheque' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createPaidChequeSchema.parse(body);
    return this.chequeService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a paid cheque (OPEN only)' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updatePaidChequeSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.chequeService.update(id, orgId, rest);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change paid cheque status' })
  async changeStatus(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ) {
    const data = paidChequeStatusSchema.parse(body);
    return this.chequeService.changeStatus(id, orgId, data, user.userId);
  }
}
