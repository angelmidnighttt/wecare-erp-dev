/**
 * Raised when creating a product whose SKU is already taken (FR-3).
 * A domain rule — independent of transport (TCP/HTTP) and storage.
 */
export class SkuAlreadyExistsError extends Error {
  constructor(sku: string) {
    super(`SKU already exists: ${sku}`);
    this.name = 'SkuAlreadyExistsError';
  }
}
