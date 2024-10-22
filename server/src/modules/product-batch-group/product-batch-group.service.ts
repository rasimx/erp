import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Field } from '@nestjs/graphql';
import { In } from 'typeorm';
import { v7 as uuidV7 } from 'uuid';

import { isNil } from '@/common/helpers/utils.js';
import { ContextService } from '@/context/context.service.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { GroupOperationReadEntity } from '@/operation/group-operation.read-entity.js';
import { GroupOperationReadRepo } from '@/operation/group-operation.read-repo.js';
import { OperationReadEntity } from '@/operation/operation.read-entity.js';
import type { ProductBatchEventEntity } from '@/product-batch/domain/product-batch.event-entity.js';
import {
  type OperationAddedEventData,
  ProductBatchEventType,
  type ProductBatchRollbackEvent,
} from '@/product-batch/domain/product-batch.events.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchGroupEventEntity } from '@/product-batch-group/domain/product-batch-group.event-entity.js';
import { ProductBatchGroupEventRepo } from '@/product-batch-group/domain/product-batch-group.event-repo.js';
import {
  type GroupOperationAddedEventData,
  type ProductBatchGroupEvent,
  ProductBatchGroupEventType,
  type ProductBatchGroupRollbackEvent,
} from '@/product-batch-group/domain/product-batch-group.events.js';
import {
  AbstractProductBatchGroup,
  type ProductBatchGroup,
  RealProductBatchGroup,
} from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupReadRepo } from '@/product-batch-group/domain/product-batch-group.read-repo.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

@Injectable()
export class ProductBatchGroupService {
  constructor(
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly productBatchGroupReadRepo: ProductBatchGroupReadRepo,
    private readonly productBatchReadRepo: ProductBatchReadRepo,
    private readonly productBatchGroupEventRepo: ProductBatchGroupEventRepo,
    private readonly groupOperationReadRepo: GroupOperationReadRepo,
  ) {}

  public async create({
    requestId,
    dto,
    queryRunner,
  }: {
    requestId: string;
    dto: {
      statusId: number;
      name: string;
    };
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<RealProductBatchGroup> {
    const productBatchGroupReadRepo = queryRunner.manager.withRepository(
      this.productBatchGroupReadRepo,
    );
    const productBatchReadRepo = queryRunner.manager.withRepository(
      this.productBatchReadRepo,
    );

    const aggregateId = await productBatchGroupReadRepo.nextId();

    const lastOrder = await productBatchReadRepo.getLastOrderInStatus(
      dto.statusId,
    );

    const productBatchGroup = RealProductBatchGroup.create({
      props: {
        ...dto,
        id: aggregateId,
        order: lastOrder ? lastOrder + 1 : 1,
      },
    });

    await this.saveAggregates({
      aggregates: [productBatchGroup],
      requestId: requestId,
      queryRunner,
    });

    return productBatchGroup;
  }

  async saveAggregates({
    aggregates,
    requestId,
    queryRunner,
  }: {
    aggregates: ProductBatchGroup[];
    requestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const productBatchGroupReadRepo = queryRunner.manager.withRepository(
      this.productBatchGroupReadRepo,
    );
    const productBatchGroupEventRepo = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepo,
    );
    const groupOperationReadRepo = queryRunner.manager.withRepository(
      this.groupOperationReadRepo,
    );

    const realAggregates = aggregates.filter(
      item => !isNil(item.id),
    ) as RealProductBatchGroup[];

    const readEntities = await productBatchGroupReadRepo.save(
      realAggregates
        .filter(item => !item.isDeleted)
        .map(item => item.toObject()),
    );

    const groupOperationReadEntities: GroupOperationReadEntity[] = [];
    const groupOperationReadEntitiesIdsForDelete: number[] = [];

    aggregates.forEach(aggregate => {
      aggregate.getEvents().forEach(event => {
        switch (event.type) {
          case ProductBatchGroupEventType.GroupOperationAdded: {
            if (event.isNew || event.isReverted) {
              const groupOperationReadEntity = new GroupOperationReadEntity();
              Object.assign(groupOperationReadEntity, event.data);
              groupOperationReadEntities.push(groupOperationReadEntity);
            }
            if (event.isJustRolledBack) {
              groupOperationReadEntitiesIdsForDelete.push(event.data.id);
            }
            break;
          }

          default:
        }
      });
    });

    const eventEntities =
      await productBatchGroupEventRepo.saveUncommittedEvents({
        aggregates,
        requestId,
      });

    if (groupOperationReadEntitiesIdsForDelete.length)
      await groupOperationReadRepo.delete(
        groupOperationReadEntitiesIdsForDelete,
      );
    if (groupOperationReadEntities.length)
      await groupOperationReadRepo.save(groupOperationReadEntities);

    await productBatchGroupReadRepo.delete({
      id: In(
        realAggregates.filter(item => item.isDeleted).map(item => item.id),
      ),
    });

    return {
      eventEntities,
      readEntities,
    };
  }

  async getReadModel({
    id,
    queryRunner,
  }: {
    id: number;
    queryRunner?: CustomPostgresQueryRunner;
  }): Promise<RealProductBatchGroup> {
    const productBatchGroupReadRepo = queryRunner
      ? queryRunner.manager.withRepository(this.productBatchGroupReadRepo)
      : this.productBatchGroupReadRepo;

    const readEntity = await productBatchGroupReadRepo.findOneOrFail({
      where: { id },
    });

    return RealProductBatchGroup.createFromReadEntity(readEntity);
  }

  async getReadModelMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, RealProductBatchGroup>> {
    const productBatchGroupReadRepo = queryRunner.manager.withRepository(
      this.productBatchGroupReadRepo,
    );

    const entities = await productBatchGroupReadRepo.find({
      where: { id: In(ids) },
    });

    if (new Set(ids).size != entities.length) {
      throw new Error('найдены не все элементы');
    }

    return new Map(
      entities.map(item => [
        item.id,
        RealProductBatchGroup.createFromReadEntity(item),
      ]),
    );
  }

  async getProjectionsMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, RealProductBatchGroup>> {
    const productBatchGroupEventRepo = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepo,
    );

    const eventEntitiesByAggregateIdMap =
      await productBatchGroupEventRepo.findManyByAggregateId(ids);

    return new Map(
      [...eventEntitiesByAggregateIdMap.entries()].map(
        ([id, eventEntities]) => [
          id,
          RealProductBatchGroup.buildProjection(
            eventEntities as ProductBatchGroupEvent[],
          ),
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
    const productBatchGroupEventRepo = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepo,
    );

    const eventEntities = await productBatchGroupEventRepo.find({
      where: {
        requestId: rolledBackRequestId,
      },
      order: { revision: 'asc' },
    });
    const rolledBackEventsByAggregateIdMap = new Map<
      number,
      ProductBatchGroupEventEntity[]
    >();
    const abstractAggregates: AbstractProductBatchGroup[] = [];

    eventEntities.forEach(event => {
      if (event.aggregateId) {
        const mapItem =
          rolledBackEventsByAggregateIdMap.get(event.aggregateId) || [];
        mapItem.push(event);
        rolledBackEventsByAggregateIdMap.set(event.aggregateId, mapItem);
      } else {
        const abstractAggregate = AbstractProductBatchGroup.createAbstract();
        abstractAggregate.applyEvents([event] as ProductBatchGroupEvent[]);
        abstractAggregates.push(abstractAggregate);
      }
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

    abstractAggregates.forEach(aggregate => {
      const events = aggregate.getEvents();
      const rolledBackEvent = events[0];
      aggregate.rollbackEvent(rolledBackEvent.id);
    });

    await this.saveAggregates({
      aggregates: [...aggregateMap.values(), ...abstractAggregates],
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
    const productBatchGroupEventRepo = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepo,
    );
    const rollbackEventEntities = await productBatchGroupEventRepo.find({
      where: {
        requestId: lastRollbackRequestId,
      },
      relations: ['rollbackTarget'],
    });

    const revertedEventsByAggregateIdMap = new Map<
      number,
      ProductBatchGroupEventEntity[]
    >();

    const abstractAggregates: AbstractProductBatchGroup[] = [];

    rollbackEventEntities.forEach(rollbackEvent => {
      const revertedEvent = rollbackEvent.rollbackTarget;
      if (!revertedEvent) throw new Error('revertedEvent was not defined');
      if (revertedEvent.aggregateId) {
        const mapItem =
          revertedEventsByAggregateIdMap.get(revertedEvent.aggregateId) || [];
        mapItem.push(rollbackEvent);
        revertedEventsByAggregateIdMap.set(revertedEvent.aggregateId, mapItem);
      } else {
        const abstractAggregate = AbstractProductBatchGroup.createAbstract();
        abstractAggregate.applyEvents([
          revertedEvent,
          rollbackEvent,
        ] as ProductBatchGroupEvent[]);

        abstractAggregates.push(abstractAggregate);
      }
    });

    const aggregateMap = await this.getProjectionsMap({
      ids: [...revertedEventsByAggregateIdMap.keys()],
      queryRunner,
    });

    [...aggregateMap.values()].forEach(aggregate => {
      const revertedEvents = revertedEventsByAggregateIdMap.get(aggregate.id);
      if (!revertedEvents) throw new Error('revertedEvents was not defined');
      revertedEvents.forEach(event => {
        aggregate.revertEvent(event as ProductBatchGroupRollbackEvent);
      });
      aggregate.rebuild();
    });

    abstractAggregates.forEach(aggregate => {
      const events = aggregate.getEvents();
      const rollbackEvent = events[
        events.length - 1
      ] as ProductBatchGroupRollbackEvent;
      aggregate.revertEvent(rollbackEvent);
    });

    await this.saveAggregates({
      aggregates: [...aggregateMap.values(), ...abstractAggregates],
      requestId,
      queryRunner,
    });

    await productBatchGroupEventRepo.delete({
      requestId: lastRollbackRequestId,
    });
  }
}
