/**
 * Raised when an operation targets a product id that does not exist.
 */
export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product not found: ${id}`);
    this.name = 'ProductNotFoundError';
  }
}
