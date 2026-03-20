import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { type AccountService } from '../../../application/services/account.service';
import { createAccountSchema, accountQuerySchema } from '@hesabdari/contracts';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('organizations/:orgId/accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'List chart of accounts' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = accountQuerySchema.parse(query);
    return this.accountService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.accountService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createAccountSchema.parse(body);
    return this.accountService.create({ organizationId: orgId, ...data });
  }
}
