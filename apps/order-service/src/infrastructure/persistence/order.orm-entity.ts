import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Persistence model (TypeORM). Kept separate from the domain entity.
 */
@Entity({ name: 'orders' })
export class OrderOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  customerId: string;

  @Column('numeric')
  total: number;

  @Column({ default: 'PENDING' })
  status: string;
}
