import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const port = parseInt(process.env.API_GATEWAY_PORT ?? '3000', 10);
  await app.listen(port);

  Logger.log(`🚀 API Gateway is running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
