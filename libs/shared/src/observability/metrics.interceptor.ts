import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  HTTP_REQUESTS_TOTAL,
  HTTP_REQUEST_DURATION,
  RPC_REQUESTS_TOTAL,
  RPC_REQUEST_DURATION,
} from './metrics.providers';

/** DI token carrying the current service name into the interceptor. */
export const OBSERVABILITY_SERVICE_NAME = 'OBSERVABILITY_SERVICE_NAME';

/**
 * Records Prometheus metrics for every HTTP request and every microservice
 * message handler. Registered globally via APP_INTERCEPTOR in
 * {@link ObservabilityModule}, so no controller has to opt in.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @Inject(OBSERVABILITY_SERVICE_NAME) private readonly service: string,
    @InjectMetric(HTTP_REQUESTS_TOTAL) private readonly httpTotal: Counter<string>,
    @InjectMetric(HTTP_REQUEST_DURATION) private readonly httpDuration: Histogram<string>,
    @InjectMetric(RPC_REQUESTS_TOTAL) private readonly rpcTotal: Counter<string>,
    @InjectMetric(RPC_REQUEST_DURATION) private readonly rpcDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType();
    if (type === 'http') return this.handleHttp(context, next);
    if (type === 'rpc') return this.handleRpc(context, next);
    return next.handle();
  }

  private handleHttp(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const start = process.hrtime.bigint();

    const record = () => {
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      // Prefer the matched route pattern (e.g. /orders/:id) over the raw url so
      // label cardinality stays bounded.
      const route = req.route?.path ?? req.url ?? 'unknown';
      const labels = {
        method: req.method,
        route,
        status_code: String(res.statusCode),
        service: this.service,
      };
      this.httpTotal.inc(labels);
      this.httpDuration.observe(labels, seconds);
    };

    return next.handle().pipe(tap({ next: record, error: record }));
  }

  private handleRpc(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const pattern = this.resolvePattern(context);
    const start = process.hrtime.bigint();

    const record = (status: 'success' | 'error') => {
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      const labels = { pattern, status, service: this.service };
      this.rpcTotal.inc(labels);
      this.rpcDuration.observe(labels, seconds);
    };

    return next.handle().pipe(
      tap({ next: () => record('success'), error: () => record('error') }),
    );
  }

  /** Best-effort extraction of the Redis message pattern for the label. */
  private resolvePattern(context: ExecutionContext): string {
    const handler = context.getHandler?.()?.name;
    const controller = context.getClass?.()?.name;
    return controller && handler ? `${controller}.${handler}` : 'unknown';
  }
}
