import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { LoginCommand } from '../login.command';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../../domain/repositories/user.repository';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '../../../domain/services/password-hasher';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
    @InjectPinoLogger(LoginHandler.name) private readonly logger: PinoLogger,
  ) {}

  async execute(command: LoginCommand) {
    this.logger.info({ email: command.email }, 'Login attempt');
    const user = await this.users.findByEmail(command.email);

    const passwordOk =
      user && (await this.hasher.compare(command.password, user.getPasswordHash()));
    if (!passwordOk) {
      this.logger.warn({ email: command.email }, 'Login failed: invalid credentials');
      throw new RpcException('Invalid credentials');
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email.value,
    });

    this.logger.info({ userId: user.id, email: user.email.value }, 'Login success');
    return { accessToken, user: { id: user.id, email: user.email.value } };
  }
}
