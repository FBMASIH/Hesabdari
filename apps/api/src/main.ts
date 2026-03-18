import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { GlobalExceptionFilter } from './platform/filters';
import { LoggingInterceptor, BigIntSerializerInterceptor } from './platform/interceptors';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  const config = app.get(AppConfig);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter — structured error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors — logging + BigInt serialization
  app.useGlobalInterceptors(new LoggingInterceptor(), new BigIntSerializerInterceptor());

  // CORS — validate request origin against the allowed list.
  // In development, also allow any same-machine origin (varying ports).
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin) return callback(null, true);
      // Allow if origin matches configured list
      if (config.corsOrigins.includes(origin)) return callback(null, true);
      // In development, allow any origin (varying IPs/ports for local network access)
      if (config.nodeEnv === 'development') return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`), false);
    },
    credentials: true,
  });

  // Global prefix — must be set before Swagger setup
  app.setGlobalPrefix('api/v1');

  // OpenAPI / Swagger (non-production only)
  if (config.nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Hesabdari API')
      .setDescription('Enterprise Web Accounting Platform API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(config.port, config.host);

  const logger = new Logger('Bootstrap');
  logger.log(`Application running on http://${config.host}:${config.port}`);
  if (config.nodeEnv !== 'production') {
    logger.log(`Swagger docs at http://${config.host}:${config.port}/api/docs`);
  }
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err instanceof Error ? err.stack : String(err));
  process.exit(1);
});
