import { Transport } from '@nestjs/microservices';

/**
 * TCP transport config. Unlike a shared broker, every microservice listens on
 * its own host:port, so the gateway client must target the right service.
 *
 * Async / fire-and-forget work will move to a message queue later — this
 * transport is for the synchronous request/response calls only.
 */
export type ServiceTcpKey = 'AUTH' | 'ORDER' | 'PRODUCT';

/** Fallback ports (4xxx) — kept off the 3xxx HTTP /metrics range. */
const DEFAULT_TCP_PORTS: Record<ServiceTcpKey, number> = {
  AUTH: 4001,
  ORDER: 4002,
  PRODUCT: 4003,
};

const portOf = (key: ServiceTcpKey): number =>
  parseInt(
    process.env[`${key}_SERVICE_TCP_PORT`] ?? String(DEFAULT_TCP_PORTS[key]),
    10,
  );

/**
 * Client proxy options — used by the API gateway to reach a microservice.
 * Host defaults to localhost (dev); in Docker set `<KEY>_SERVICE_TCP_HOST` to
 * the service's container name.
 */
export const tcpClientOptions = (key: ServiceTcpKey) => ({
  transport: Transport.TCP as const,
  options: {
    host: process.env[`${key}_SERVICE_TCP_HOST`] ?? 'localhost',
    port: portOf(key),
  },
});

/**
 * Listener options — used by a microservice itself. Binds 0.0.0.0 so the
 * gateway can reach it across the Docker network (not just loopback).
 */
export const tcpServerOptions = (key: ServiceTcpKey) => ({
  transport: Transport.TCP as const,
  options: {
    host: '0.0.0.0',
    port: portOf(key),
  },
});
