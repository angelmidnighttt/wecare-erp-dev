import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

/**
 * Repository port (interface). Implemented in the infrastructure layer.
 */
export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
}
