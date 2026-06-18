import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrderQuery } from '../get-order.query';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../../domain/repositories/order.repository';

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
  ) {}

  async execute(query: GetOrderQuery) {
    const order = await this.orders.findById(query.id);
    if (!order) {
      return { id: query.id, found: false };
    }
    return {
      id: order.id,
      customerId: order.customerId,
      total: order.total.amount,
      status: order.status,
      found: true,
    };
  }
}
