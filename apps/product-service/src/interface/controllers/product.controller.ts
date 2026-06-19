import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PRODUCT_PATTERNS } from '@app/shared';
import { CreateProductCommand } from '../../application/commands/create-product.command';
import { UpdateProductCommand } from '../../application/commands/update-product.command';
import { ActivateProductCommand } from '../../application/commands/activate-product.command';
import { DeactivateProductCommand } from '../../application/commands/deactivate-product.command';
import { GetProductQuery } from '../../application/queries/get-product.query';

/**
 * Message controller — translates TCP transport messages into CQRS
 * commands / queries.
 */
@Controller()
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // FR-1: create
  @MessagePattern(PRODUCT_PATTERNS.CREATE)
  create(
    @Payload()
    data: { sku: string; name: string; unit: string; defaultPrice: number },
  ) {
    return this.commandBus.execute(
      new CreateProductCommand(
        data.sku,
        data.name,
        data.unit,
        data.defaultPrice,
      ),
    );
  }

  // FR-1: edit
  @MessagePattern(PRODUCT_PATTERNS.UPDATE)
  update(
    @Payload()
    data: { id: string; name?: string; unit?: string; defaultPrice?: number },
  ) {
    return this.commandBus.execute(
      new UpdateProductCommand(
        data.id,
        data.name,
        data.unit,
        data.defaultPrice,
      ),
    );
  }

  // FR-2: activate
  @MessagePattern(PRODUCT_PATTERNS.ACTIVATE)
  activate(@Payload() data: { id: string }) {
    return this.commandBus.execute(new ActivateProductCommand(data.id));
  }

  // FR-2: deactivate
  @MessagePattern(PRODUCT_PATTERNS.DEACTIVATE)
  deactivate(@Payload() data: { id: string }) {
    return this.commandBus.execute(new DeactivateProductCommand(data.id));
  }

  @MessagePattern(PRODUCT_PATTERNS.GET_PRODUCT)
  getProduct(@Payload() data: { id: string }) {
    return this.queryBus.execute(new GetProductQuery(data.id));
  }
}
