import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderOrmEntity } from './persistence/order.orm-entity';
import { TypeOrmOrderRepository } from './persistence/order.repository.impl';
import { ORDER_REPOSITORY } from '../domain/repositories/order.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity])],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: TypeOrmOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class InfrastructureModule {}
