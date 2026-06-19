import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ObservabilityModule, postgresTypeOrmOptions } from '@app/shared';
import { OrderOrmEntity } from './infrastructure/persistence/order.orm-entity';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationModule } from './application/application.module';
import { OrderController } from './interface/controllers/order.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule.forRoot({ serviceName: 'order-service' }),
    TypeOrmModule.forRootAsync({
      useFactory: () => postgresTypeOrmOptions([OrderOrmEntity]),
    }),
    CqrsModule,
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [OrderController],
})
export class OrderServiceModule {}
