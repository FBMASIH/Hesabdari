import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from '../../../application/services/organization.service';
import { createOrganizationSchema, updateOrganizationSchema } from '@hesabdari/contracts';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findById(@Param('id') id: string) {
    return this.organizationService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  async create(@Body() body: unknown) {
    const data = createOrganizationSchema.parse(body);
    return this.organizationService.create(data);
  }

  @Put(':id/default-currency')
  @ApiOperation({ summary: 'Update organization default currency' })
  async updateDefaultCurrency(@Param('id') id: string, @Body() body: unknown) {
    const data = updateOrganizationSchema.parse({ ...(body as object), id });
    if (data.defaultCurrencyId) {
      return this.organizationService.updateDefaultCurrency(id, data.defaultCurrencyId);
    }
    return this.organizationService.findById(id);
  }
}
