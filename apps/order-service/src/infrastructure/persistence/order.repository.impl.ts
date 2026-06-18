import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderOrmEntity } from './order.orm-entity';
import { Order } from '../../domain/entities/order.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { OrderRepository } from '../../domain/repositories/order.repository';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repo: Repository<OrderOrmEntity>,
  ) {}

  async save(order: Order): Promise<void> {
    await this.repo.save({
      id: order.id,
      customerId: order.customerId,
      total: order.total.amount,
      status: order.status,
    });
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) return null;
    return new Order(
      row.id,
      row.customerId,
      Money.create(Number(row.total)),
      row.status,
    );
  }
}
