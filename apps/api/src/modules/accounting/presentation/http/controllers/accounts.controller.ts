import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountService } from '../../../application/services/account.service';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('organizations/:orgId/accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'List chart of accounts' })
  async list(@Param('orgId') orgId: string) {
    return this.accountService.findByOrganization(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  async findById(@Param('id') id: string) {
    return this.accountService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  async create(
    @Param('orgId') orgId: string,
    @Body() body: { code: string; name: string; type: string; parentId?: string },
  ) {
    return this.accountService.create({ organizationId: orgId, ...body });
  }
}
