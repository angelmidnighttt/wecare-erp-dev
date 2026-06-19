import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductQuery } from '../get-product.query';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { toResponse } from '../../commands/handlers/create-product.handler';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<GetProductQuery> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(query: GetProductQuery) {
    const product = await this.products.findById(query.id);
    if (!product) {
      return { id: query.id, found: false };
    }
    return { ...toResponse(product), found: true };
  }
}
