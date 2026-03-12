import { Injectable } from '@nestjs/common';
import type { PrismaService } from '@/platform/database/prisma.service';
import type { JournalEntryStatus } from '@hesabdari/db';

@Injectable()
export class JournalEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.journalEntry.findUnique({
      where: { id },
      include: { lines: true },
    });
  }

  async findByOrganizationId(organizationId: string) {
    return this.prisma.journalEntry.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: JournalEntryStatus, postedAt?: Date, postedBy?: string) {
    return this.prisma.journalEntry.update({
      where: { id },
      data: { status, postedAt, postedBy },
    });
  }
}
