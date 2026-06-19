import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateProductCommand } from '../create-product.command';
import { Product } from '../../../domain/entities/product.entity';
import { ProductCreatedEvent } from '../../../domain/events/product-created.event';
import { SkuAlreadyExistsError } from '../../../domain/errors/sku-already-exists.error';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../domain/repositories/product.repository';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    private readonly eventBus: EventBus,
    @InjectPinoLogger(CreateProductHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreateProductCommand) {
    this.logger.info({ sku: command.sku }, 'Creating product');

    // Build the entity first so VO invariants (SKU format, price >= 0) run.
    const id = `product_${Date.now()}`;
    const product = Product.create(
      id,
      command.sku,
      command.name,
      command.unit,
      command.defaultPrice,
    );

    // FR-3: SKU must be unique system-wide.
    const existing = await this.products.findBySku(product.sku.value);
    if (existing) {
      this.logger.warn(
        { sku: product.sku.value },
        'Create rejected: SKU already exists',
      );
      throw new RpcException(
        new SkuAlreadyExistsError(product.sku.value).message,
      );
    }

    await this.products.save(product);
    this.eventBus.publish(
      new ProductCreatedEvent(id, product.sku.value, product.name),
    );

    this.logger.info({ productId: id, sku: product.sku.value }, 'Product created');
    return toResponse(product);
  }
}

/** Shared serialisation of a Product into a transport response. */
export function toResponse(product: Product) {
  return {
    id: product.id,
    sku: product.sku.value,
    name: product.name,
    unit: product.unit,
    defaultPrice: product.defaultPrice.amount,
    active: product.active,
  };
}
