import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ORDER_SERVICE, tcpClientOptions } from '@app/shared';
import { OrderController } from './order.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ORDER_SERVICE,
        useFactory: () => tcpClientOptions('ORDER'),
      },
    ]),
  ],
  controllers: [OrderController],
})
export class OrderModule {}
