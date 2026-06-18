/**
 * Message patterns exchanged over the Redis transport between the gateway and
 * the microservices. Keep them centralised so producer and consumer never drift.
 */
export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  GET_USER: 'auth.get_user',
} as const;

export const ORDER_PATTERNS = {
  CREATE: 'order.create',
  GET_ORDER: 'order.get_order',
} as const;
