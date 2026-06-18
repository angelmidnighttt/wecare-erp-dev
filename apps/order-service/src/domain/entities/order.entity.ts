import { Money } from '../value-objects/money.vo';

/**
 * Order aggregate root (pure domain model).
 */
export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly total: Money,
    public readonly status: string = 'PENDING',
  ) {}

  static create(id: string, customerId: string, total: number): Order {
    return new Order(id, customerId, Money.create(total), 'PENDING');
  }
}
