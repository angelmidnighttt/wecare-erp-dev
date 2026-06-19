/**
 * Domain event raised when a product's attributes are edited.
 */
export class ProductUpdatedEvent {
  constructor(public readonly productId: string) {}
}
