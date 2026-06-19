import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PRODUCT_SERVICE, tcpClientOptions } from '@app/shared';
import { ProductController } from './product.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PRODUCT_SERVICE,
        useFactory: () => tcpClientOptions('PRODUCT'),
      },
    ]),
  ],
  controllers: [ProductController],
})
export class ProductModule {}
