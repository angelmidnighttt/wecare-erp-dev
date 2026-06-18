import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { LoginHandler } from './commands/handlers/login.handler';
import { GetUserHandler } from './queries/handlers/get-user.handler';

export const CommandHandlers = [RegisterUserHandler, LoginHandler];
export const QueryHandlers = [GetUserHandler];

@Module({
  imports: [
    CqrsModule,
    InfrastructureModule,
    // Same secret as the API gateway — auth-service signs, gateway verifies.
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev_secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' },
    }),
  ],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ApplicationModule {}
