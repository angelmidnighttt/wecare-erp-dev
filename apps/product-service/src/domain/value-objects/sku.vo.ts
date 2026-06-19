/**
 * SKU value object — the product's unique business identifier (FR-3).
 * Normalised to upper-case so uniqueness is case-insensitive.
 */
export class Sku {
  private constructor(public readonly value: string) {}

  static create(value: string): Sku {
    const normalised = value?.trim().toUpperCase() ?? '';
    if (!/^[A-Z0-9][A-Z0-9._-]*$/.test(normalised)) {
      throw new Error(`Invalid SKU: ${value}`);
    }
    return new Sku(normalised);
  }

  toString(): string {
    return this.value;
  }
}
