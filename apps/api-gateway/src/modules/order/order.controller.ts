import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE, ORDER_PATTERNS } from '@app/shared';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() body: { customerId: string; total: number }) {
    return this.orderClient.send(ORDER_PATTERNS.CREATE, body);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderClient.send(ORDER_PATTERNS.GET_ORDER, { id });
  }
}
