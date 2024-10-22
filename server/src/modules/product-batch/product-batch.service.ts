import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { type FindOptionsWhere, In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import { GroupOperationReadEntity } from '@/operation/group-operation.read-entity.js';
import { OperationReadEntity } from '@/operation/operation.read-entity.js';
import { OperationReadRepo } from '@/operation/operation.read-repo.js';
import { ProductService } from '@/product/product.service.js';
import type { ProductBatchEventEntity } from '@/product-batch/domain/product-batch.event-entity.js';
import { ProductBatchEventRepo } from '@/product-batch/domain/product-batch.event-repo.js';
import {
  type OperationAddedEventData,
  type ProductBatchEvent,
  ProductBatchEventType,
  type ProductBatchRollbackEvent,
} from '@/product-batch/domain/product-batch.events.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { CreateProductBatchesFromSourcesListDto } from '@/product-batch/dtos/create-product-batches-from-sources-list.dto.js';
import {
  type GroupOperationAddedEventData,
  ProductBatchGroupEventType,
} from '@/product-batch-group/domain/product-batch-group.events.js';
import type { RealProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { StatusService } from '@/status/status.service.js';

@Injectable()
export class ProductBatchService {
  constructor(
    private readonly contextService: ContextService,
    private readonly statusService: StatusService,
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly ozonPostingProductMicroservice: OzonPostingProductMicroservice,
    private readonly productBatchReadRepo: ProductBatchReadRepo,
    private readonly productService: ProductService,
    private readonly productBatchGroupService: ProductBatchGroupService,
    private readonly productBatchEventRepo: ProductBatchEventRepo,
    private readonly operationReadRepo: OperationReadRepo,
  ) {}

  async relinkPostings({
    queryRunner,
    affectedIds = [],
    affectedGroupIds = [],
    deletedIds = [],
    deletedGroupIds = [],
  }: {
    queryRunner: CustomPostgresQueryRunner;
    affectedIds?: number[];
    affectedGroupIds?: number[];
    deletedIds?: number[];
    deletedGroupIds?: number[];
  }) {
    const where: FindOptionsWhere<ProductBatchReadEntity>[] = [];
    const ids = [...affectedIds, ...deletedIds];
    if (ids.length) {
      where.push({ id: In(ids) });
    }

    const groupIds = [...affectedGroupIds, ...deletedGroupIds];
    if (groupIds.length) {
      where.push({ groupId: In(groupIds) });
    }
    // здесь запрос идет не в транзакции
    const oldVersions = await this.productBatchReadRepo.find({
      where,
      relations: ['status', 'group', 'group.status'],
    });

    // здесь в транзакции
    const transactionalProductBatchRepository =
      queryRunner.manager.withRepository(this.productBatchReadRepo);
    const affectedProductBatches =
      await transactionalProductBatchRepository.find({
        where,
        withDeleted: !!(deletedIds.length || deletedGroupIds.length),
        relations: ['status', 'group', 'group.status'],
      });

    const map = new Map<number, Map<number, number[]>>(); //storeId

    affectedProductBatches.forEach(item => {
      const storeId = item.status?.storeId ?? item.group?.status.storeId;
      if (storeId) {
        const storeMapItem = map.get(storeId) ?? new Map<number, number[]>();
        const productMapItem = storeMapItem.get(item.productId) ?? [];
        productMapItem.push(item.id);
        storeMapItem.set(item.productId, productMapItem);
        map.set(storeId, storeMapItem);
      }
    });

    const storeMap = new Map<number, Map<number, ProductBatchReadEntity[]>>();
    if (map.size) {
      for (const [storeId, subMap] of map.entries()) {
        const batchesForRelinkMap =
          await transactionalProductBatchRepository.findLatest({
            items: [...subMap.entries()].map(
              ([productId, productBatchIds]) => ({
                productId,
                productBatchIds,
              }),
            ),
            storeId,
          });
        storeMap.set(storeId, batchesForRelinkMap);
      }
    }

    oldVersions.forEach(oldVersion => {
      const status = oldVersion.status ?? oldVersion.group?.status;
      if (!status) throw new Error('status relation is required');
      const oldVersionStoreId = status.storeId;

      if (
        oldVersionStoreId &&
        (!storeMap
          .get(oldVersionStoreId)
          ?.get(oldVersion.productId)
          ?.find(item => item.id == oldVersion.id) ||
          deletedIds.includes(oldVersion.id) ||
          (oldVersion.group && deletedGroupIds.includes(oldVersion.group.id)))
      ) {
        const storeMapItem =
          storeMap.get(oldVersionStoreId) ??
          new Map<number, ProductBatchReadEntity[]>();
        const productMapItem = storeMapItem.get(oldVersion.productId) ?? [];
        productMapItem.push({
          ...oldVersion,
          count: 0,
        } as ProductBatchReadEntity);
        storeMapItem.set(oldVersion.productId, productMapItem);
        storeMap.set(oldVersionStoreId, storeMapItem);
      }
    });

    if (storeMap.size) {
      const { success } =
        await this.ozonPostingProductMicroservice.relinkPostings({
          items: [...storeMap.entries()].map(([storeId, mapByProductId]) => ({
            storeId,
            items: [...mapByProductId.entries()].map(
              ([baseProductId, productBatches]) => ({
                baseProductId,
                productBatches,
              }),
            ),
          })),
        });
      if (!success) throw new Error('relink error');
    }
  }

  async saveAggregates({
    aggregates,
    requestId,
    queryRunner,
  }: {
    aggregates: ProductBatch[];
    requestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const productBatchReadRepo = queryRunner.manager.withRepository(
      this.productBatchReadRepo,
    );
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    const operationReadRepo = queryRunner.manager.withRepository(
      this.operationReadRepo,
    );

    const operationsForDeleteIds: number[] = [];
    const operationsForSave: OperationReadEntity[] = [];

    aggregates.forEach(aggregate => {
      aggregate.getEvents().forEach(event => {
        switch (event.type) {
          case ProductBatchEventType.GroupOperationAdded:
          case ProductBatchEventType.OperationAdded: {
            if (event.isNew || event.isReverted) {
              const operation = new OperationReadEntity();
              Object.assign(operation, event.data);
              operationsForSave.push(operation);
            }
            if (event.isJustRolledBack) {
              operationsForDeleteIds.push(
                (event.data as OperationAddedEventData).id,
              );
            }
            break;
          }

          default:
        }
      });
    });

    const eventEntities = await productBatchEventRepo.saveUncommittedEvents({
      aggregates,
      requestId,
    });

    if (operationsForDeleteIds.length) {
      await operationReadRepo.delete(operationsForDeleteIds);
    }
    if (operationsForSave.length > 0) {
      await operationReadRepo.save(operationsForSave);
    }

    const readEntities = await productBatchReadRepo.save(
      aggregates
        .filter(item => !item.isDeleted)
        .map(item => {
          const readEntity = new ProductBatchReadEntity();
          Object.assign(readEntity, item.toObject());

          return readEntity;
        }),
    );

    await productBatchReadRepo.delete({
      id: In(aggregates.filter(item => item.isDeleted).map(item => item.id)),
    });

    return {
      eventEntities,
      aggregates: readEntities.map(item =>
        ProductBatch.createFromReadEntity(item),
      ),
      readEntities,
    };
  }

  async getReadModel({
    id,
    queryRunner,
  }: {
    id: number;
    queryRunner?: CustomPostgresQueryRunner;
  }): Promise<ProductBatch> {
    const productBatchReadRepo = queryRunner
      ? queryRunner.manager.withRepository(this.productBatchReadRepo)
      : this.productBatchReadRepo;

    const readEntity = await productBatchReadRepo.findOneOrFail({
      where: { id },
      relations: ['product'],
    });

    return ProductBatch.createFromReadEntity(readEntity);
  }

  async getReadModelMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, ProductBatch>> {
    const productBatchReadRepo = queryRunner.manager.withRepository(
      this.productBatchReadRepo,
    );

    const entities = await productBatchReadRepo.find({
      where: { id: In(ids) },
    });

    if (new Set(ids).size != entities.length) {
      throw new Error('найдены не все элементы');
    }

    return new Map(
      entities.map(item => [item.id, ProductBatch.createFromReadEntity(item)]),
    );
  }

  async shouldSplitAndReturnNewChild({
    productBatch,
    queryRunner,
  }: {
    productBatch: ProductBatch;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<ProductBatch | null> {
    if (!productBatch.shouldSplit()) return null;

    const productBatchReadRepo = queryRunner.manager.withRepository(
      this.productBatchReadRepo,
    );

    const aggregatedIds = await productBatchReadRepo.nextIds(1);

    return ProductBatch.createFromSources({
      ...productBatch.toObject(),
      id: aggregatedIds[0],
      sources: [
        {
          productBatch,
          qty: 1,
        },
      ],
    });
  }

  async getProjectionsMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, ProductBatch>> {
    // const productBatchReadRepo = queryRunner.manager.withRepository(
    //   this.productBatchReadRepo,
    // );
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    const eventEntitiesByAggregateIdMap =
      await productBatchEventRepo.findManyByAggregateId(ids);

    return new Map(
      [...eventEntitiesByAggregateIdMap.entries()].map(
        ([id, eventEntities]) => [
          id,
          ProductBatch.buildProjection(eventEntities as ProductBatchEvent[]),
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
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    const eventEntities = await productBatchEventRepo.find({
      where: {
        requestId: rolledBackRequestId,
      },
      order: { revision: 'asc' },
    });
    const rolledBackEventsByAggregateIdMap = new Map<
      number,
      ProductBatchEventEntity[]
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
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );
    const eventEntities = await productBatchEventRepo.find({
      where: {
        requestId: lastRollbackRequestId,
      },
      relations: ['rollbackTarget'],
    });

    const revertedEventsByAggregateIdMap = new Map<
      number,
      ProductBatchEventEntity[]
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
        aggregate.revertEvent(event as ProductBatchRollbackEvent);
      });
      aggregate.rebuild();
    });

    await this.saveAggregates({
      aggregates: [...aggregateMap.values()],
      requestId,
      queryRunner,
    });

    await productBatchEventRepo.delete({
      requestId: lastRollbackRequestId,
    });
  }

  async createFromSources({
    requestId,
    dto,
    queryRunner,
  }: {
    requestId: string;
    dto: CreateProductBatchesFromSourcesListDto;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<{
    group: RealProductBatchGroup | null;
    items: Map<number, ProductBatch>;
  }> {
    const productBatchReadRepo = queryRunner.manager.withRepository(
      this.productBatchReadRepo,
    );

    let group: RealProductBatchGroup | null = null;
    if (dto.grouped) {
      if (!dto.statusId) throw new Error('dto.statusId was not defined');
      if (!dto.groupName) throw new Error('dto.groupName was not defined');

      group = await this.productBatchGroupService.create({
        requestId,
        queryRunner,
        dto: {
          statusId: dto.statusId,
          name: dto.groupName,
        },
      });

      dto.groupId = group.id;
    }

    const affectedIds: number[] = [];

    const aggregatedIds = await productBatchReadRepo.nextIds(dto.items.length);

    const lastOrder = dto.groupId
      ? null
      : await productBatchReadRepo.getLastOrderInStatus(dto.statusId);

    const sourceBathesMap = await this.getReadModelMap({
      ids: dto.items.flatMap(item => item.sourceIds),
      queryRunner,
    });

    const productsMap = await this.productService.getReadModelMap({
      ids: dto.items.map(({ productId }) => productId),
      queryRunner,
    });

    const aggregates: ProductBatch[] = [];

    for (let index = 0; index < dto.items.length; ++index) {
      const aggregateId = aggregatedIds.shift();
      if (!aggregateId) throw new Error('aggregateId was not defined');

      const item = dto.items[index];

      const order = lastOrder ? lastOrder + index + 1 : index + 1;

      const product = productsMap.get(item.productId);
      if (!product) throw new Error('productId was not found');

      const newProductBatch = ProductBatch.createFromSources({
        id: aggregateId,
        count: item.count,
        productId: item.productId,
        statusId: dto.groupId ? null : dto.statusId,
        groupId: dto.groupId,
        order,
        sources: item.sourceIds.map(sourceId => {
          const sourceAggregate = sourceBathesMap.get(sourceId);
          if (!sourceAggregate)
            throw new Error('sourceAggregate was not found');
          // todo: проверить productId через productSet
          const qty = product.toObject().setItems.length
            ? product
                .toObject()
                .setItems.find(
                  item => item.productId === sourceAggregate.getProductId(),
                )?.qty || 1
            : 1;

          return {
            qty,
            productBatch: sourceAggregate,
          };
        }),
        weight: product.getWeight() * item.count,
        volume: product.getVolume() * item.count,
      });
      aggregates.push(newProductBatch);
    }

    await this.saveAggregates({
      aggregates: [...aggregates, ...sourceBathesMap.values()],
      requestId,
      queryRunner,
    });

    return { group, items: new Map(aggregates.map(item => [item.id, item])) };
  }
}
