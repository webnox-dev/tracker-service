import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

function flattenValidationErrors(validationErrors: ValidationError[]): string[] {
  const messages = new Set<string>();

  const visit = (errors: ValidationError[]): void => {
    for (const error of errors) {
      if (error.constraints) {
        for (const message of Object.values(error.constraints)) {
          messages.add(message);
        }
      }

      if (error.children && error.children.length > 0) {
        visit(error.children);
      }
    }
  };

  visit(validationErrors);

  return [...messages];
}

async function bootstrap(): Promise<void> {
  const bootstrapLogger = new Logger('Bootstrap');
  const validationLogger = new Logger('ValidationPipe');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow<string>('app.corsOrigin'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errors = flattenValidationErrors(validationErrors);

        validationLogger.warn(
          `Validation failed with ${errors.length} issue(s): ${errors.join('; ')}`,
        );

        return new BadRequestException({
          message: 'Validation Failed',
          errors,
        });
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerPath = configService.getOrThrow<string>('app.swaggerPath');
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Tracker Service API')
      .setDescription(
        'Phase 1 Tracker Service for collecting validated tracking events from the JavaScript SDK.',
      )
      .setVersion('1.0.0')
      .build(),
  );

  SwaggerModule.setup(swaggerPath, app, document, {
    jsonDocumentUrl: `${swaggerPath}-json`,
  });

  const port = configService.getOrThrow<number>('app.port');
  await app.listen(port);

  bootstrapLogger.log(
    `${configService.getOrThrow<string>('app.serviceName')} listening on port ${port}`,
  );
  bootstrapLogger.log(`Swagger available at /${swaggerPath}`);
}

void bootstrap();
