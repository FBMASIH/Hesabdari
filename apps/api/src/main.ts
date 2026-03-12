import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';

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

  // CORS
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });

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

  // Global prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(config.port, config.host);

  const logger = new Logger('Bootstrap');
  logger.log(`Application running on http://${config.host}:${config.port}`);
  if (config.nodeEnv !== 'production') {
    logger.log(`Swagger docs at http://${config.host}:${config.port}/api/docs`);
  }
}

bootstrap();
