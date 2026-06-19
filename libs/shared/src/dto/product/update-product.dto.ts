import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Partial update of a product (FR-1, edit). SKU is immutable — it is the
 * product's business identity — so it is intentionally not editable here.
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultPrice?: number;
}
