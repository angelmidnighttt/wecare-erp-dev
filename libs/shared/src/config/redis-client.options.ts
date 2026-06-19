import { Transport, RedisOptions } from '@nestjs/microservices';

/** Host/port pair shared by the transport and any raw ioredis connection. */
export const redisConnection = () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
});

/**
 * Shared factory for the Redis transport options so the gateway client proxies
 * and the microservice listeners always talk to the same broker.
 */
export const redisClientOptions = (): RedisOptions => ({
  transport: Transport.REDIS,
  options: redisConnection(),
});
