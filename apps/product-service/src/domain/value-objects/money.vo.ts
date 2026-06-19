/**
 * Money value object — guards against negative amounts. Used for the product's
 * default selling price.
 */
export class Money {
  private constructor(public readonly amount: number) {}

  static create(amount: number): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(`Money cannot be negative: ${amount}`);
    }
    return new Money(amount);
  }
}
