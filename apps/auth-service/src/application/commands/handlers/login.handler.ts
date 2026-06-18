import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { LoginCommand } from '../login.command';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../../domain/repositories/user.repository';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  async execute(command: LoginCommand) {
    const user = await this.users.findByEmail(command.email);

    // Hello-world hashing — replace with bcrypt.compare in real code.
    if (!user || user.getPasswordHash() !== `hashed(${command.password})`) {
      throw new RpcException('Invalid credentials');
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email.value,
    });

    return { accessToken, user: { id: user.id, email: user.email.value } };
  }
}
