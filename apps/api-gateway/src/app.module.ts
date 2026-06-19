import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObservabilityModule } from '@app/shared';
import { AppController } from './app.controller';
import { SecurityModule } from './common/security.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule.forRoot({ serviceName: 'api-gateway' }),
    SecurityModule,
    AuthModule,
    OrderModule,
    ProductModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
