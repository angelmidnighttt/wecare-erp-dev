import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateOrderCommand } from '../create-order.command';
import { Order } from '../../../domain/entities/order.entity';
import { OrderCreatedEvent } from '../../../domain/events/order-created.event';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../../domain/repositories/order.repository';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    private readonly eventBus: EventBus,
    @InjectPinoLogger(CreateOrderHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreateOrderCommand) {
    this.logger.info(
      { customerId: command.customerId, total: command.total },
      'Creating order',
    );

    const id = `order_${Date.now()}`;
    const order = Order.create(id, command.customerId, command.total);

    await this.orders.save(order);
    this.eventBus.publish(
      new OrderCreatedEvent(id, command.customerId, command.total),
    );

    this.logger.info(
      { orderId: id, customerId: command.customerId, total: command.total },
      'Order created',
    );
    return { id, customerId: command.customerId, total: command.total };
  }
}
