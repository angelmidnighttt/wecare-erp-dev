/**
 * Message patterns exchanged over the Redis transport between the gateway and
 * the microservices. Keep them centralised so producer and consumer never drift.
 */
export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  GET_USER: 'auth.get_user',
} as const;

export const ORDER_PATTERNS = {
  CREATE: 'order.create',
  GET_ORDER: 'order.get_order',
} as const;

export const PRODUCT_PATTERNS = {
  CREATE: 'product.create',
  GET_PRODUCT: 'product.get_product',
  LIST: 'product.list',
  UPDATE: 'product.update',
  DELETE: 'product.delete',
} as const;
