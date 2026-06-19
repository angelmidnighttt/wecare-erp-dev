import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger as PinoLogger } from 'nestjs-pino';
import { redisClientOptions } from '@app/shared';
import { AuthServiceModule } from './auth-service.module';

/**
 * Hybrid app: it consumes Redis messages (business transport) AND exposes a
 * small HTTP server so Prometheus can scrape `/metrics` (and `/health`).
 */
async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  app.connectMicroservice<MicroserviceOptions>(redisClientOptions());

  await app.startAllMicroservices();

  const httpPort = parseInt(process.env.AUTH_SERVICE_HTTP_PORT ?? '3001', 10);
  await app.listen(httpPort);

  app
    .get(PinoLogger)
    .log(
      `🔐 Auth Service listening (Redis transport) — metrics on :${httpPort}/metrics`,
      'Bootstrap',
    );
}
bootstrap();
