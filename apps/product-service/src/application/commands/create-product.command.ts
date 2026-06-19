export class CreateProductCommand {
  constructor(
    public readonly sku: string,
    public readonly name: string,
    public readonly unit: string,
    public readonly defaultPrice: number,
  ) {}
}
