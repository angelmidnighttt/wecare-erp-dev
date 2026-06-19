import { ClientOptions } from '@elastic/elasticsearch';

/**
 * Shared Elasticsearch connection settings. Used both by the Pino log shipper
 * (tracking) and by any service that needs to query ES directly.
 */
export const elasticsearchNode = (): string =>
  process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200';

/**
 * Index that all structured application logs are shipped to. Pino-elasticsearch
 * appends a date suffix (e.g. `wecare-logs-2026.06.19`) when `op_type` rolls.
 */
export const elasticsearchLogIndex = (): string =>
  process.env.ELASTICSEARCH_LOG_INDEX ?? 'wecare-logs';

/**
 * Factory for the official `@elastic/elasticsearch` client options. Auth is
 * optional so the same factory works against the dev (security-disabled) node
 * and a secured cluster in prod.
 */
export const elasticsearchClientOptions = (): ClientOptions => {
  const options: ClientOptions = { node: elasticsearchNode() };

  if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
    options.auth = {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    };
  }

  return options;
};
