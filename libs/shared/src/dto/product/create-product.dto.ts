import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Payload accepted when creating a product. Validated + transformed by the
 * gateway's global ValidationPipe before being forwarded over the transport.
 */
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  sku!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  // Stored as the smallest currency unit (e.g. cents) to mirror Money VO.
  @IsInt()
  @IsPositive()
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;
}
