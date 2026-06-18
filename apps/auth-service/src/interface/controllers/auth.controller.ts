import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AUTH_PATTERNS } from '@app/shared';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { GetUserQuery } from '../../application/queries/get-user.query';

/**
 * Message controller — translates Redis transport messages into CQRS
 * commands / queries.
 */
@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() data: { email: string; password: string }) {
    return this.commandBus.execute(
      new RegisterUserCommand(data.email, data.password),
    );
  }

  @MessagePattern(AUTH_PATTERNS.GET_USER)
  getUser(@Payload() data: { id: string }) {
    return this.queryBus.execute(new GetUserQuery(data.id));
  }
}
