import { Transport, RedisOptions } from '@nestjs/microservices';

/**
 * Shared factory for the Redis transport options so the gateway client proxies
 * and the microservice listeners always talk to the same broker.
 */
export const redisClientOptions = (): RedisOptions => ({
  transport: Transport.REDIS,
  options: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
});
