import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { ReceivedChequeService } from '../../../application/services/received-cheque.service';
import {
  createReceivedChequeSchema,
  updateReceivedChequeSchema,
  receivedChequeStatusSchema,
  receivedChequeQuerySchema,
} from '@hesabdari/contracts';

@ApiTags('Received Cheques')
@ApiBearerAuth()
@Controller('organizations/:orgId/received-cheques')
export class ReceivedChequesController {
  constructor(private readonly chequeService: ReceivedChequeService) {}

  @Get()
  @ApiOperation({ summary: 'List received cheques' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = receivedChequeQuerySchema.parse(query);
    return this.chequeService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get received cheque by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.chequeService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a received cheque' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createReceivedChequeSchema.parse(body);
    return this.chequeService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a received cheque (OPEN only)' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateReceivedChequeSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.chequeService.update(id, orgId, rest);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change received cheque status' })
  async changeStatus(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const data = receivedChequeStatusSchema.parse(body);
    return this.chequeService.changeStatus(id, orgId, data);
  }
}
