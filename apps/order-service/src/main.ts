import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger as PinoLogger } from 'nestjs-pino';
import { redisClientOptions } from '@app/shared';
import { OrderServiceModule } from './order-service.module';

/**
 * Hybrid app: it consumes Redis messages (business transport) AND exposes a
 * small HTTP server so Prometheus can scrape `/metrics` (and `/health`).
 */
async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  app.connectMicroservice<MicroserviceOptions>(redisClientOptions());

  await app.startAllMicroservices();

  const httpPort = parseInt(process.env.ORDER_SERVICE_HTTP_PORT ?? '3002', 10);
  await app.listen(httpPort);

  app
    .get(PinoLogger)
    .log(
      `📦 Order Service listening (Redis transport) — metrics on :${httpPort}/metrics`,
      'Bootstrap',
    );
}
bootstrap();
