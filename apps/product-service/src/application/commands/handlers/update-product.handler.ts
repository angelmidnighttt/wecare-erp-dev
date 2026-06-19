import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UpdateProductCommand } from '../update-product.command';
import { ProductUpdatedEvent } from '../../../domain/events/product-updated.event';
import { ProductNotFoundError } from '../../../domain/errors/product-not-found.error';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { toResponse } from './create-product.handler';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    private readonly eventBus: EventBus,
    @InjectPinoLogger(UpdateProductHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: UpdateProductCommand) {
    this.logger.info({ productId: command.id }, 'Updating product');

    const product = await this.products.findById(command.id);
    if (!product) {
      throw new RpcException(new ProductNotFoundError(command.id).message);
    }

    // SKU is intentionally not editable — it is the product's identity.
    product.update({
      name: command.name,
      unit: command.unit,
      defaultPrice: command.defaultPrice,
    });

    await this.products.save(product);
    this.eventBus.publish(new ProductUpdatedEvent(product.id));

    this.logger.info({ productId: product.id }, 'Product updated');
    return toResponse(product);
  }
}
