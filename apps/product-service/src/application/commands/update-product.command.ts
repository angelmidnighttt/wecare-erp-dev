export class UpdateProductCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly unit?: string,
    public readonly defaultPrice?: number,
  ) {}
}
