import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    await this.repo.save({
      id: user.id,
      email: user.email.value,
      passwordHash: user.getPasswordHash(),
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) return null;
    return new User(row.id, Email.create(row.email), row.passwordHash);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { email: email.toLowerCase() } });
    if (!row) return null;
    return new User(row.id, Email.create(row.email), row.passwordHash);
  }
}
