import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Payload accepted when creating a product (FR-1). Validated + transformed by
 * the gateway's global ValidationPipe before being forwarded over the transport.
 */
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  // Unit of measure (đơn vị tính) — e.g. "cái", "kg", "thùng".
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  unit!: string;

  // Default selling price, stored as the smallest currency unit (e.g. VND).
  @IsInt()
  @Min(0)
  defaultPrice!: number;
}
