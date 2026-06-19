import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ActivateProductCommand } from '../activate-product.command';
import { ProductStatusChangedEvent } from '../../../domain/events/product-status-changed.event';
import { ProductNotFoundError } from '../../../domain/errors/product-not-found.error';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { toResponse } from './create-product.handler';

@CommandHandler(ActivateProductCommand)
export class ActivateProductHandler
  implements ICommandHandler<ActivateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    private readonly eventBus: EventBus,
    @InjectPinoLogger(ActivateProductHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ActivateProductCommand) {
    const product = await this.products.findById(command.id);
    if (!product) {
      throw new RpcException(new ProductNotFoundError(command.id).message);
    }

    product.activate(); // FR-2
    await this.products.save(product);
    this.eventBus.publish(new ProductStatusChangedEvent(product.id, true));

    this.logger.info({ productId: product.id }, 'Product activated');
    return toResponse(product);
  }
}
