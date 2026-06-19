import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger as PinoLogger } from 'nestjs-pino';
import { tcpServerOptions } from '@app/shared';
import { ProductServiceModule } from './product-service.module';

/**
 * Hybrid app: it serves synchronous TCP requests (business transport) AND
 * exposes a small HTTP server so Prometheus can scrape `/metrics` (`/health`).
 */
async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));

  // inheritAppConfig: so the global metrics interceptor (APP_INTERCEPTOR) also
  // wraps @MessagePattern handlers — otherwise RPC metrics never record.
  app.connectMicroservice<MicroserviceOptions>(tcpServerOptions('PRODUCT'), {
    inheritAppConfig: true,
  });

  await app.startAllMicroservices();

  const httpPort = parseInt(process.env.PRODUCT_SERVICE_HTTP_PORT ?? '3003', 10);
  await app.listen(httpPort);

  app
    .get(PinoLogger)
    .log(
      `🏷️  Product Service listening (TCP transport) — metrics on :${httpPort}/metrics`,
      'Bootstrap',
    );
}
bootstrap();
