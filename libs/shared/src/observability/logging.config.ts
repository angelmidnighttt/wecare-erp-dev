import { Params } from 'nestjs-pino';
import { elasticsearchLogIndex, elasticsearchNode } from '../config/elasticsearch.config';

/**
 * Builds the nestjs-pino configuration for a given service.
 *
 * Logs are fanned out to two transports:
 *  - `pino-elasticsearch` → ships structured JSON to Elasticsearch (tracking,
 *    searchable in Kibana / Grafana).
 *  - `pino-pretty` → human-readable console output for local development.
 *
 * Every log line is tagged with `service` so a single ES index can hold logs
 * from the whole platform and still be filterable per service.
 */
export const loggerConfig = (serviceName: string): Params => ({
  pinoHttp: {
    name: serviceName,
    level: process.env.LOG_LEVEL ?? 'info',
    // Attach the service name to every record for cross-service filtering.
    base: { service: serviceName },
    // A stable request id makes it possible to follow one request across logs.
    genReqId: (req, res) => {
      const existing = req.headers['x-request-id'];
      if (existing) return Array.isArray(existing) ? existing[0] : existing;
      const id = req.id ?? `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      res.setHeader('x-request-id', String(id));
      return id;
    },
    transport: {
      targets: [
        {
          target: 'pino-elasticsearch',
          level: process.env.LOG_LEVEL ?? 'info',
          options: {
            node: elasticsearchNode(),
            index: elasticsearchLogIndex(),
            esVersion: 8,
            flushBytes: 1000,
          },
        },
        {
          target: 'pino-pretty',
          level: process.env.LOG_LEVEL ?? 'info',
          options: { singleLine: true, translateTime: 'SYS:standard' },
        },
      ],
    },
    // Trim noisy health/metrics probes out of the request logs.
    autoLogging: {
      ignore: (req) => req.url === '/metrics' || req.url === '/health',
    },
  },
});
