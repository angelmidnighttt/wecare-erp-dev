/**
 * Money value object — guards against negative amounts.
 */
export class Money {
  private constructor(public readonly amount: number) {}

  static create(amount: number): Money {
    if (amount < 0) {
      throw new Error(`Money cannot be negative: ${amount}`);
    }
    return new Money(amount);
  }
}
