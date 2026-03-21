import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JournalEntryService } from '../../../application/services/journal-entry.service';
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  journalEntryQuerySchema,
} from '@hesabdari/contracts';
import { CurrentUser, type RequestUser } from '@/platform/decorators';

@ApiTags('Journal Entries')
@ApiBearerAuth()
@Controller('organizations/:orgId/journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntryService: JournalEntryService) {}

  @Get()
  @ApiOperation({ summary: 'List journal entries' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = journalEntryQuerySchema.parse(query);
    return this.journalEntryService.findByOrganization(orgId, parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.journalEntryService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a draft journal entry with lines (transactional)' })
  async create(
    @Param('orgId') orgId: string,
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ) {
    const data = createJournalEntrySchema.parse(body);
    return this.journalEntryService.create(orgId, data, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a DRAFT journal entry (transactional)' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateJournalEntrySchema.parse({ ...(body as object), id });
    return this.journalEntryService.update(id, orgId, data);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post a draft journal entry' })
  async post(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.journalEntryService.post(id, orgId, user.userId);
  }
}
