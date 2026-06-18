import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ORDER_PATTERNS } from '@app/shared';
import { CreateOrderCommand } from '../../application/commands/create-order.command';
import { GetOrderQuery } from '../../application/queries/get-order.query';

/**
 * Message controller — translates Redis transport messages into CQRS
 * commands / queries.
 */
@Controller()
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(ORDER_PATTERNS.CREATE)
  create(@Payload() data: { customerId: string; total: number }) {
    return this.commandBus.execute(
      new CreateOrderCommand(data.customerId, data.total),
    );
  }

  @MessagePattern(ORDER_PATTERNS.GET_ORDER)
  getOrder(@Payload() data: { id: string }) {
    return this.queryBus.execute(new GetOrderQuery(data.id));
  }
}
