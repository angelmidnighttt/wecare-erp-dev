import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderOrmEntity } from './infrastructure/persistence/order.orm-entity';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationModule } from './application/application.module';
import { OrderController } from './interface/controllers/order.controller';

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
        entities: [OrderOrmEntity],
        synchronize: true, // dev only
      }),
    }),
    CqrsModule,
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [OrderController],
})
export class OrderServiceModule {}
