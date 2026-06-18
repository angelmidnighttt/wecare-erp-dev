import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationModule } from './application/application.module';
import { AuthController } from './interface/controllers/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
        username: process.env.POSTGRES_USER ?? 'wecare',
        password: process.env.POSTGRES_PASSWORD ?? 'wecare_secret',
        database: process.env.POSTGRES_DB ?? 'wecare',
        entities: [UserOrmEntity],
        synchronize: true, // dev only
      }),
    }),
    CqrsModule,
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [AuthController],
})
export class AuthServiceModule {}
