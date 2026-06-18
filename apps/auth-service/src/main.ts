import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { redisClientOptions } from '@app/shared';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    redisClientOptions(),
  );

  await app.listen();
  Logger.log('🔐 Auth Service is listening (Redis transport)', 'Bootstrap');
}
bootstrap();
