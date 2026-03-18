import type { OnModuleInit, OnModuleDestroy} from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('VALKEY_HOST', 'localhost'),
      port: this.configService.get<number>('VALKEY_PORT', 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number): number | null {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
      },
      enableReadyCheck: true,
    });

    this.client.on('error', (err: Error) => {
      this.logger.warn(`Cache connection error: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Cache connection established');
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Cache unavailable at startup: ${message} — running without cache`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status === 'ready' || this.client.status === 'connecting') {
      await this.client.quit();
      this.logger.log('Cache connection closed');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // Cache write failure is non-critical — log silently
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // Cache delete failure is non-critical
    }
  }
}
