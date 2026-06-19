import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './logging.config';
import { metricsProviders } from './metrics.providers';
import {
  MetricsInterceptor,
  OBSERVABILITY_SERVICE_NAME,
} from './metrics.interceptor';

export interface ObservabilityOptions {
  /** Service name used as a label on metrics and a field on every log line. */
  serviceName: string;
  /**
   * Path the Prometheus `/metrics` endpoint is exposed on. Defaults to
   * `/metrics`. (The api-gateway sets a global `api` prefix, so its scrape
   * path becomes `/api/metrics`.)
   */
  metricsPath?: string;
}

/**
 * One-stop observability wiring for every service:
 *  - Prometheus metrics endpoint + default process metrics (monitoring)
 *  - Custom HTTP / RPC request metrics via a global interceptor
 *  - Structured logging shipped to Elasticsearch via Pino (tracking)
 *
 * Usage: `ObservabilityModule.forRoot({ serviceName: 'order-service' })`.
 */
@Global()
@Module({})
export class ObservabilityModule {
  static forRoot(options: ObservabilityOptions): DynamicModule {
    return {
      module: ObservabilityModule,
      imports: [
        LoggerModule.forRoot(loggerConfig(options.serviceName)),
        PrometheusModule.register({
          path: options.metricsPath ?? '/metrics',
          defaultMetrics: { enabled: true },
        }),
      ],
      providers: [
        ...metricsProviders,
        {
          provide: OBSERVABILITY_SERVICE_NAME,
          useValue: options.serviceName,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: MetricsInterceptor,
        },
      ],
      exports: [PrometheusModule, LoggerModule],
    };
  }
}
