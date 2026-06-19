/**
 * Domain event raised when a product is activated / deactivated (FR-2).
 */
export class ProductStatusChangedEvent {
  constructor(
    public readonly productId: string,
    public readonly active: boolean,
  ) {}
}
