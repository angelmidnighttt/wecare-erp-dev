import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ObservabilityModule, postgresTypeOrmOptions } from '@app/shared';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationModule } from './application/application.module';
import { AuthController } from './interface/controllers/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule.forRoot({ serviceName: 'auth-service' }),
    TypeOrmModule.forRootAsync({
      useFactory: () => postgresTypeOrmOptions([UserOrmEntity]),
    }),
    CqrsModule,
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [AuthController],
})
export class AuthServiceModule {}
