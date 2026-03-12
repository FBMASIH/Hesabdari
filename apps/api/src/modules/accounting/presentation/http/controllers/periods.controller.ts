import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PeriodService } from '../../../application/services/period.service';
import { CurrentUser, type RequestUser } from '@/platform/decorators';

@ApiTags('Accounting Periods')
@ApiBearerAuth()
@Controller('organizations/:orgId/periods')
export class PeriodsController {
  constructor(private readonly periodService: PeriodService) {}

  @Get()
  @ApiOperation({ summary: 'List accounting periods' })
  async list(@Param('orgId') orgId: string) {
    return this.periodService.findByOrganization(orgId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close an accounting period' })
  async close(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.periodService.close(id, user.userId);
  }
}
