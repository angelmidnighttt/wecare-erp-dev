import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE, ORDER_PATTERNS } from '@app/shared';
import { JwtAuthGuard, JwtUser } from '../../common/jwt-auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';

// Every order route is protected; the gateway forwards the verified userId.
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() body: { total: number }) {
    // customerId comes from the trusted JWT, not the request body.
    return this.orderClient.send(ORDER_PATTERNS.CREATE, {
      customerId: user.sub,
      total: body.total,
    });
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderClient.send(ORDER_PATTERNS.GET_ORDER, { id });
  }
}
