/**
 * Domain event raised when an order is created.
 */
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
  ) {}
}
