import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from '../../../application/services/organization.service';

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
  async create(@Body() body: { name: string; slug: string }) {
    return this.organizationService.create(body);
  }
}
