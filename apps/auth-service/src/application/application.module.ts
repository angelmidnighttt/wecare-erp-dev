import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { GetUserHandler } from './queries/handlers/get-user.handler';

export const CommandHandlers = [RegisterUserHandler];
export const QueryHandlers = [GetUserHandler];

@Module({
  imports: [CqrsModule, InfrastructureModule],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ApplicationModule {}
