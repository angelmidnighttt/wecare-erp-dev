import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

/**
 * Shared factory for the PostgreSQL TypeORM options so every service points at
 * the same database with identical connection settings. Each service only has
 * to pass in the ORM entities it owns.
 *
 * Keeping this centralised means a change to pooling / SSL / logging happens in
 * one place instead of being copy-pasted into every `*-service.module.ts`.
 */
export const postgresTypeOrmOptions = (
  entities: EntityClassOrSchema[],
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'wecare',
  password: process.env.POSTGRES_PASSWORD ?? 'wecare_secret',
  database: process.env.POSTGRES_DB ?? 'wecare',
  entities,
  // dev only — schema is auto-created. Disable and use migrations in prod.
  synchronize: true,
});
