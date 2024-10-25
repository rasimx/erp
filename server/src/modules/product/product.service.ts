import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import type { ProductEventEntity } from '@/product/domain/product.event-entity.js';
import { ProductEventRepo } from '@/product/domain/product.event-repo.js';
import type {
  ProductEvent,
  ProductRollbackEvent,
} from '@/product/domain/product.events.js';
import { Product } from '@/product/domain/product.js';
import {
  type ProductInsertEntity,
  ProductReadEntity,
} from '@/product/domain/product.read-entity.js';
import { ProductReadRepo } from '@/product/domain/product.read-repo.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly productReadRepo: ProductReadRepo,
    private readonly productEventRepo: ProductEventRepo,
    @InjectDataSource()
    private readonly dataSource: CustomDataSource,
  ) {}

  async saveAggregates({
    aggregates,
    requestId,
    queryRunner,
  }: {
    aggregates: Product[];
    requestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const productReadRepo = queryRunner.manager.withRepository(
      this.productReadRepo,
    );
    const productEventRepo = queryRunner.manager.withRepository(
      this.productEventRepo,
    );

    const eventEntities = await productEventRepo.saveUncommittedEvents({
      aggregates,
      requestId,
    });

    const readEntities = await productReadRepo.save(
      aggregates
        .filter(item => !item.isDeleted)
        .map(item => {
          const readEntity = new ProductReadEntity();
          Object.assign(readEntity, item.toObject());

          return readEntity;
        }),
    );

    await productReadRepo.delete({
      id: In(aggregates.filter(item => item.isDeleted).map(item => item.id)),
    });

    return {
      eventEntities,
      aggregates: readEntities.map(item => Product.createFromReadEntity(item)),
      readEntities,
    };
  }

  async getReadModel({
    id,
    queryRunner,
  }: {
    id: number;
    queryRunner?: CustomPostgresQueryRunner;
  }): Promise<Product> {
    const productReadRepo = queryRunner
      ? queryRunner.manager.withRepository(this.productReadRepo)
      : this.productReadRepo;

    const readEntity = await productReadRepo.findOneOrFail({
      where: { id },
      relations: ['setItems'],
    });

    return Product.createFromReadEntity(readEntity);
  }

  async getReadModelMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, Product>> {
    const productReadRepo = queryRunner.manager.withRepository(
      this.productReadRepo,
    );

    const entities = await productReadRepo.find({
      where: { id: In(ids) },
      relations: ['setItems'],
    });

    if (new Set(ids).size != entities.length) {
      throw new Error('найдены не все элементы');
    }

    return new Map(
      entities.map(item => [item.id, Product.createFromReadEntity(item)]),
    );
  }

  // async insert(data: ProductInsertEntity[]) {
  //   await this.repository.insert(data);
  //   return this.repository.find({
  //     where: { sku: In(data.map(({ sku }) => sku)) },
  //   });
  // }

  async createInsertTransaction(items: ProductInsertEntity[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(ProductReadEntity, items);
      const newItems = await queryRunner.manager.find(ProductReadEntity, {
        where: { sku: In(items.map(({ sku }) => sku)) },
      });

      const transactionId = await queryRunner.prepareTransaction();

      // todo: удалять транзакции по истечении какого-то времени

      return { items: newItems, transactionId };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      return { items: [], error: (error as Error).message };
    } finally {
      await queryRunner.release();
    }
  }

  async findManyBySku(skuList: string[]) {
    return this.productReadRepo.find({
      where: {
        sku: In(skuList),
      },
    });
  }

  async getProjectionsMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, Product>> {
    const productEventRepo = queryRunner.manager.withRepository(
      this.productEventRepo,
    );

    const eventEntitiesByAggregateIdMap =
      await productEventRepo.findManyByAggregateId(ids);

    return new Map(
      [...eventEntitiesByAggregateIdMap.entries()].map(
        ([id, eventEntities]) => [
          id,
          Product.buildProjection(eventEntities as ProductEvent[]),
        ],
      ),
    );
  }

  async rollback({
    requestId,
    rolledBackRequestId,
    queryRunner,
  }: {
    requestId: string;
    rolledBackRequestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const productEventRepo = queryRunner.manager.withRepository(
      this.productEventRepo,
    );

    const eventEntities = await productEventRepo.find({
      where: {
        requestId: rolledBackRequestId,
      },
      order: { revision: 'asc' },
    });
    const rolledBackEventsByAggregateIdMap = new Map<
      number,
      ProductEventEntity[]
    >();
    eventEntities.forEach(event => {
      const mapItem =
        rolledBackEventsByAggregateIdMap.get(event.aggregateId) || [];
      mapItem.push(event);
      rolledBackEventsByAggregateIdMap.set(event.aggregateId, mapItem);
    });

    const aggregateMap = await this.getProjectionsMap({
      ids: [...rolledBackEventsByAggregateIdMap.keys()],
      queryRunner,
    });

    [...aggregateMap.values()].forEach(aggregate => {
      const eventEntities = rolledBackEventsByAggregateIdMap.get(aggregate.id);
      if (!eventEntities) throw new Error('eventEntities was not defined');
      eventEntities.forEach(event => {
        aggregate.rollbackEvent(event.id);
      });
      aggregate.rebuild();
    });

    await this.saveAggregates({
      aggregates: [...aggregateMap.values()],
      queryRunner,
      requestId,
    });
  }

  async revert({
    lastRollbackRequestId,
    queryRunner,
    requestId,
  }: {
    lastRollbackRequestId: string;
    queryRunner: CustomPostgresQueryRunner;
    requestId: string;
  }) {
    const productEventRepo = queryRunner.manager.withRepository(
      this.productEventRepo,
    );
    const eventEntities = await productEventRepo.find({
      where: {
        requestId: lastRollbackRequestId,
      },
      relations: ['rollbackTarget'],
    });

    const revertedEventsByAggregateIdMap = new Map<
      number,
      ProductEventEntity[]
    >();
    eventEntities.forEach(event => {
      const revertedEvent = event.rollbackTarget;
      if (!revertedEvent) throw new Error('revertedEvent was not defined');
      const mapItem =
        revertedEventsByAggregateIdMap.get(revertedEvent.aggregateId) || [];
      mapItem.push(event);
      revertedEventsByAggregateIdMap.set(revertedEvent.aggregateId, mapItem);
    });

    const aggregateMap = await this.getProjectionsMap({
      ids: [...revertedEventsByAggregateIdMap.keys()],
      queryRunner,
    });

    [...aggregateMap.values()].forEach(aggregate => {
      const revertedEvents = revertedEventsByAggregateIdMap.get(aggregate.id);
      if (!revertedEvents) throw new Error('revertedEvents was not defined');
      revertedEvents.forEach(event => {
        aggregate.revertEvent(event as ProductRollbackEvent);
      });
      aggregate.rebuild();
    });

    await this.saveAggregates({
      aggregates: [...aggregateMap.values()],
      requestId,
      queryRunner,
    });

    await productEventRepo.delete({
      requestId: lastRollbackRequestId,
    });
  }
}
