import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

/** Metric names — referenced by the interceptor and any custom instrumentation. */
export const HTTP_REQUESTS_TOTAL = 'http_requests_total';
export const HTTP_REQUEST_DURATION = 'http_request_duration_seconds';
export const RPC_REQUESTS_TOTAL = 'rpc_requests_total';
export const RPC_REQUEST_DURATION = 'rpc_request_duration_seconds';

/**
 * Prometheus metric providers shared by every service. Registered once inside
 * {@link ObservabilityModule} and injected into the metrics interceptor.
 */
export const metricsProviders = [
  makeCounterProvider({
    name: HTTP_REQUESTS_TOTAL,
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'service'],
  }),
  makeHistogramProvider({
    name: HTTP_REQUEST_DURATION,
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code', 'service'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  }),
  makeCounterProvider({
    name: RPC_REQUESTS_TOTAL,
    help: 'Total number of RPC (microservice message) requests',
    labelNames: ['pattern', 'status', 'service'],
  }),
  makeHistogramProvider({
    name: RPC_REQUEST_DURATION,
    help: 'RPC (microservice message) duration in seconds',
    labelNames: ['pattern', 'status', 'service'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  }),
];
