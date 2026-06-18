import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { GetOrderHandler } from './queries/handlers/get-order.handler';

export const CommandHandlers = [CreateOrderHandler];
export const QueryHandlers = [GetOrderHandler];

@Module({
  imports: [CqrsModule, InfrastructureModule],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ApplicationModule {}
