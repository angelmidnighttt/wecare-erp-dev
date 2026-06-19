/**
 * Domain event raised when a product is created.
 */
export class ProductCreatedEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly name: string,
  ) {}
}
