import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOrmEntity } from './persistence/product.orm-entity';
import { TypeOrmProductRepository } from './persistence/product.repository.impl';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: TypeOrmProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class InfrastructureModule {}
