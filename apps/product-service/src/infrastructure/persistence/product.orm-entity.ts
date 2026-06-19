import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Persistence model (TypeORM). Kept separate from the domain entity.
 */
@Entity({ name: 'products' })
export class ProductOrmEntity {
  @PrimaryColumn()
  id!: string;

  // FR-3: SKU unique system-wide — enforced at the DB level too.
  @Column({ unique: true })
  sku!: string;

  @Column()
  name!: string;

  @Column()
  unit!: string;

  @Column('numeric')
  defaultPrice!: number;

  @Column({ default: true })
  active!: boolean;
}
