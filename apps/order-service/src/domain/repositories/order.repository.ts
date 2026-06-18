import { Order } from '../entities/order.entity';

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

/**
 * Repository port (interface). Implemented in the infrastructure layer.
 */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
