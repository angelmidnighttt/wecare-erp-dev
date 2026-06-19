import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  // Route Nest's logs through Pino so they're shipped to Elasticsearch too.
  app.useLogger(app.get(PinoLogger));
  app.setGlobalPrefix('api');

  // Validate + transform every incoming DTO at the edge so microservices
  // downstream always receive clean, typed payloads.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not declared on the DTO
      forbidNonWhitelisted: true, // 400 if unknown properties are sent
      transform: true, // plain payload -> DTO instance (class-transformer)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = parseInt(process.env.API_GATEWAY_PORT ?? '3000', 10);
  await app.listen(port);

  app
    .get(PinoLogger)
    .log(`🚀 API Gateway running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
