import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ObservabilityModule, postgresTypeOrmOptions } from '@app/shared';
import { ProductOrmEntity } from './infrastructure/persistence/product.orm-entity';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationModule } from './application/application.module';
import { ProductController } from './interface/controllers/product.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule.forRoot({ serviceName: 'product-service' }),
    TypeOrmModule.forRootAsync({
      useFactory: () => postgresTypeOrmOptions([ProductOrmEntity]),
    }),
    CqrsModule,
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [ProductController],
})
export class ProductServiceModule {}
