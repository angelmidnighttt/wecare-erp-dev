import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RegisterUserCommand } from '../register-user.command';
import { User } from '../../../domain/entities/user.entity';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';
import { EmailAlreadyRegisteredError } from '../../../domain/errors/email-already-registered.error';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../../domain/repositories/user.repository';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '../../../domain/services/password-hasher';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
    private readonly eventBus: EventBus,
    @InjectPinoLogger(RegisterUserHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: RegisterUserCommand) {
    // First arg is structured metadata (searchable in Kibana), second is the message.
    this.logger.info({ email: command.email }, 'Registering new user');

    // Domain rule: no two users may share an email.
    const existing = await this.users.findByEmail(command.email);
    if (existing) {
      this.logger.warn({ email: command.email }, 'Registration rejected: email taken');
      // Translate the domain error into a transport-level error for the caller.
      throw new RpcException(new EmailAlreadyRegisteredError(command.email).message);
    }

    const id = `user_${Date.now()}`;
    const passwordHash = await this.hasher.hash(command.password);
    const user = User.register(id, command.email, passwordHash);

    await this.users.save(user);
    this.eventBus.publish(new UserRegisteredEvent(id, command.email));

    // Auto-login: issue a JWT right after registration.
    const accessToken = this.jwt.sign({ sub: id, email: command.email });

    this.logger.info({ userId: id, email: command.email }, 'User registered');
    return { accessToken, user: { id, email: command.email } };
  }
}
