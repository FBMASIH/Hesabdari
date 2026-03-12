import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../decorators';
import type { PrismaService } from '../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    const dbHealthy = await this.checkDatabase();
    const status = dbHealthy ? 'healthy' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
      },
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready() {
    const dbHealthy = await this.checkDatabase();
    if (!dbHealthy) {
      return { status: 'not_ready' };
    }
    return { status: 'ready' };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
