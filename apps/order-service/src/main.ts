import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { redisClientOptions } from '@app/shared';
import { OrderServiceModule } from './order-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    redisClientOptions(),
  );

  await app.listen();
  Logger.log('📦 Order Service is listening (Redis transport)', 'Bootstrap');
}
bootstrap();
