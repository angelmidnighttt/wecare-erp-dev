import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
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
  ) {}

  async execute(command: CreateOrderCommand) {
    const id = `order_${Date.now()}`;
    const order = Order.create(id, command.customerId, command.total);

    await this.orders.save(order);
    this.eventBus.publish(
      new OrderCreatedEvent(id, command.customerId, command.total),
    );

    return { id, customerId: command.customerId, total: command.total };
  }
}
