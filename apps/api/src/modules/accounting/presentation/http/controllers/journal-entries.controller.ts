import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JournalEntryService } from '../../../application/services/journal-entry.service';
import { CurrentUser, type RequestUser } from '@/platform/decorators';

@ApiTags('Journal Entries')
@ApiBearerAuth()
@Controller('organizations/:orgId/journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntryService: JournalEntryService) {}

  @Get()
  @ApiOperation({ summary: 'List journal entries' })
  async list(@Param('orgId') orgId: string) {
    return this.journalEntryService.findByOrganization(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  async findById(@Param('id') id: string) {
    return this.journalEntryService.findById(id);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post a draft journal entry' })
  async post(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.journalEntryService.post(id, user.userId);
  }
}
