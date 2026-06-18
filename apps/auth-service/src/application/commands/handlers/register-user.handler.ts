import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
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
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand) {
    // Hello world: skip real hashing/persistence wiring details.
    const id = `user_${Date.now()}`;
    const user = User.register(id, command.email, `hashed(${command.password})`);

    await this.users.save(user);
    this.eventBus.publish(new UserRegisteredEvent(id, command.email));

    return { id, email: command.email };
  }
}
