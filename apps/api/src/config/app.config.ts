import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('API_PORT', 4000);
  }

  get host(): string {
    return this.configService.get<string>('API_HOST', '0.0.0.0');
  }

  get corsOrigins(): string[] {
    const origins = this.configService.get<string>('API_CORS_ORIGINS', 'http://localhost:3000');
    return origins.split(',').map((o) => o.trim());
  }

  get databaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get valkeyHost(): string {
    return this.configService.get<string>('VALKEY_HOST', 'localhost');
  }

  get valkeyPort(): number {
    return this.configService.get<number>('VALKEY_PORT', 6379);
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  get jwtExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION', '15m');
  }

  get jwtRefreshExpiration(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
  }
}
