import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Persistence model (TypeORM). Kept separate from the domain entity.
 */
@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;
}
