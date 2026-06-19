import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CreateProductHandler } from './commands/handlers/create-product.handler';
import { UpdateProductHandler } from './commands/handlers/update-product.handler';
import { ActivateProductHandler } from './commands/handlers/activate-product.handler';
import { DeactivateProductHandler } from './commands/handlers/deactivate-product.handler';
import { GetProductHandler } from './queries/handlers/get-product.handler';

export const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  ActivateProductHandler,
  DeactivateProductHandler,
];
export const QueryHandlers = [GetProductHandler];

@Module({
  imports: [CqrsModule, InfrastructureModule],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ApplicationModule {}
