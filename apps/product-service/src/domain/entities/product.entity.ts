import { Sku } from '../value-objects/sku.vo';
import { Money } from '../value-objects/money.vo';

/** Fields that may change after creation (FR-1, edit). SKU is excluded. */
export interface ProductChanges {
  name?: string;
  unit?: string;
  defaultPrice?: number;
}

/**
 * Product aggregate root (pure domain model — no framework / ORM concerns).
 * Holds the invariants for FR-1 (attributes), FR-2 (active lifecycle) and
 * FR-3 (SKU identity).
 */
export class Product {
  constructor(
    public readonly id: string,
    public readonly sku: Sku,
    private _name: string,
    private _unit: string,
    private _defaultPrice: Money,
    private _active: boolean = true,
  ) {
    this.assertName(_name);
    this.assertUnit(_unit);
  }

  static create(
    id: string,
    sku: string,
    name: string,
    unit: string,
    defaultPrice: number,
  ): Product {
    // A product is sellable (active) the moment it is created.
    return new Product(
      id,
      Sku.create(sku),
      name.trim(),
      unit.trim(),
      Money.create(defaultPrice),
      true,
    );
  }

  /** Apply a partial edit. Only the provided fields change. */
  update(changes: ProductChanges): void {
    if (changes.name !== undefined) {
      this.assertName(changes.name);
      this._name = changes.name.trim();
    }
    if (changes.unit !== undefined) {
      this.assertUnit(changes.unit);
      this._unit = changes.unit.trim();
    }
    if (changes.defaultPrice !== undefined) {
      this._defaultPrice = Money.create(changes.defaultPrice);
    }
  }

  /** FR-2: put the product back on sale. */
  activate(): void {
    this._active = true;
  }

  /** FR-2: stop selling the product (kept for history, not deleted). */
  deactivate(): void {
    this._active = false;
  }

  get name(): string {
    return this._name;
  }

  get unit(): string {
    return this._unit;
  }

  get defaultPrice(): Money {
    return this._defaultPrice;
  }

  get active(): boolean {
    return this._active;
  }

  private assertName(name: string): void {
    if (!name || !name.trim()) {
      throw new Error('Product name must not be empty');
    }
  }

  private assertUnit(unit: string): void {
    if (!unit || !unit.trim()) {
      throw new Error('Product unit must not be empty');
    }
  }
}
