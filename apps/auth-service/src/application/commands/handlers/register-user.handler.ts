import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RegisterUserCommand } from '../register-user.command';
import { User } from '../../../domain/entities/user.entity';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../../domain/repositories/user.repository';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly jwt: JwtService,
    private readonly eventBus: EventBus,
    @InjectPinoLogger(RegisterUserHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: RegisterUserCommand) {
    // First arg is structured metadata (searchable in Kibana), second is the message.
    this.logger.info({ email: command.email }, 'Registering new user');

    // Hello world: skip real hashing/persistence wiring details.
    const id = `user_${Date.now()}`;
    const user = User.register(id, command.email, `hashed(${command.password})`);

    await this.users.save(user);
    this.eventBus.publish(new UserRegisteredEvent(id, command.email));

    // Auto-login: issue a JWT right after registration.
    const accessToken = this.jwt.sign({ sub: id, email: command.email });

    this.logger.info({ userId: id, email: command.email }, 'User registered');
    return { accessToken, user: { id, email: command.email } };
  }
}
