import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './persistence/user.orm-entity';
import { TypeOrmUserRepository } from './persistence/user.repository.impl';
import { USER_REPOSITORY } from '../domain/repositories/user.repository';
import { PASSWORD_HASHER } from '../domain/services/password-hasher';
import { BcryptPasswordHasher } from './security/bcrypt-password-hasher';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER],
})
export class InfrastructureModule {}
