import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';
import { Product } from '../../domain/entities/product.entity';
import { Sku } from '../../domain/value-objects/sku.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async save(product: Product): Promise<void> {
    await this.repo.save({
      id: product.id,
      sku: product.sku.value,
      name: product.name,
      unit: product.unit,
      defaultPrice: product.defaultPrice.amount,
      active: product.active,
    });
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    // SKU is stored normalised (upper-case) by the Sku value object.
    const row = await this.repo.findOne({ where: { sku: sku.toUpperCase() } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: ProductOrmEntity): Product {
    return new Product(
      row.id,
      Sku.create(row.sku),
      row.name,
      row.unit,
      Money.create(Number(row.defaultPrice)),
      row.active,
    );
  }
}
