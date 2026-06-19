import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { DeactivateProductCommand } from '../deactivate-product.command';
import { ProductStatusChangedEvent } from '../../../domain/events/product-status-changed.event';
import { ProductNotFoundError } from '../../../domain/errors/product-not-found.error';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { toResponse } from './create-product.handler';

@CommandHandler(DeactivateProductCommand)
export class DeactivateProductHandler
  implements ICommandHandler<DeactivateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    private readonly eventBus: EventBus,
    @InjectPinoLogger(DeactivateProductHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: DeactivateProductCommand) {
    const product = await this.products.findById(command.id);
    if (!product) {
      throw new RpcException(new ProductNotFoundError(command.id).message);
    }

    product.deactivate(); // FR-2: ngừng kinh doanh
    await this.products.save(product);
    this.eventBus.publish(new ProductStatusChangedEvent(product.id, false));

    this.logger.info({ productId: product.id }, 'Product deactivated');
    return toResponse(product);
  }
}
