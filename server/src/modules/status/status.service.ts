import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { OperationReadEntity } from '@/operation/operation.read-entity.js';
import {
  type OperationAddedEventData,
  ProductBatchEventType,
} from '@/product-batch/domain/product-batch.events.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';
import { CreateStatusCommand } from '@/status/commands/create-status/create-status.command.js';
import type { StatusEventEntity } from '@/status/domain/status.event-entity.js';
import { StatusEventRepo } from '@/status/domain/status.event-repo.js';
import type {
  StatusEvent,
  StatusRollbackEvent,
} from '@/status/domain/status.events.js';
import { Status } from '@/status/domain/status.js';
import { StatusReadEntity } from '@/status/domain/status.read-entity.js';
import { StatusReadRepo } from '@/status/domain/status.read-repo.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import type { StatusDto } from '@/status/dtos/status.dto.js';
import { GetStatusListQuery } from '@/status/queries/get-status-list/get-status-list.query.js';

@Injectable()
export class StatusService {
  constructor(
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly statusReadRepo: StatusReadRepo,
    private readonly statusEventRepo: StatusEventRepo,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {
    // this.run();
  }

  async createStatus(dto: CreateStatusDto): Promise<StatusDto[]> {
    await this.commandBus.execute(new CreateStatusCommand(dto));
    return this.queryBus.execute(new GetStatusListQuery([]));
  }

  async run() {
    await this.contextService.run(async () => {
      this.contextService.userId = 1;

      // return this.a();
    });
  }

  // async a() {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //
  //   const statusRepo = queryRunner.manager.withRepository(this.statusRepo);
  //   const statusEventRepo = queryRunner.manager.withRepository(
  //     this.statusEventRepo,
  //   );
  //
  //   try {
  //     const entities = await statusRepo.find();
  //
  //     const aggregates = entities.map(entity => {
  //       return Status.create({
  //         id: entity.id,
  //         type: entity.type,
  //         title: entity.title,
  //         order: entity.order,
  //         storeId: entity.storeId,
  //       });
  //     });
  //
  //     await statusEventRepo.saveAggregateEvents({
  //       aggregates,
  //       requestId: '01927037-a31c-7556-91a5-b21a9b6d3b34',
  //     });
  //     await queryRunner.commitTransaction();
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     throw err;
  //   } finally {
  //     // you need to release a queryRunner which was manually instantiated
  //     await queryRunner.release();
  //   }
  // }

  public async create({
    requestId,
    dto,
    queryRunner,
  }: {
    requestId: string;
    dto: CreateStatusDto;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Status> {
    const statusReadRepo = queryRunner.manager.withRepository(
      this.statusReadRepo,
    );

    const aggregateId = await statusReadRepo.nextId();

    const lastOrder = await statusReadRepo.getLastOrder();

    const status = Status.create({
      props: {
        ...dto,
        id: aggregateId,
        order: lastOrder ? lastOrder + 1 : 1,
      },
    });

    await this.saveAggregates({
      aggregates: [status],
      requestId: requestId,
      queryRunner,
    });

    return status;
  }

  async saveAggregates({
    aggregates,
    requestId,
    queryRunner,
  }: {
    aggregates: Status[];
    requestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const statusReadRepo = queryRunner.manager.withRepository(
      this.statusReadRepo,
    );
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );

    const eventEntities = await statusEventRepo.saveUncommittedEvents({
      aggregates,
      requestId,
    });

    const readEntities = await statusReadRepo.save(
      aggregates
        .filter(item => !item.isDeleted)
        .map(item => {
          const readEntity = new StatusReadEntity();
          Object.assign(readEntity, item.toObject());

          return readEntity;
        }),
    );

    await statusReadRepo.delete({
      id: In(aggregates.filter(item => item.isDeleted).map(item => item.id)),
    });

    return {
      eventEntities,
      aggregates: readEntities.map(item => Status.createFromReadEntity(item)),
      readEntities,
    };
  }

  async getReadModel({
    id,
    queryRunner,
  }: {
    id: number;
    queryRunner?: CustomPostgresQueryRunner;
  }): Promise<Status> {
    const statusReadRepo = queryRunner
      ? queryRunner.manager.withRepository(this.statusReadRepo)
      : this.statusReadRepo;

    const readEntity = await statusReadRepo.findOneOrFail({
      where: { id },
    });

    return Status.createFromReadEntity(readEntity);
  }

  async getReadModelMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, Status>> {
    const statusReadRepo = queryRunner.manager.withRepository(
      this.statusReadRepo,
    );

    const entities = await statusReadRepo.find({
      where: { id: In(ids) },
    });

    if (new Set(ids).size != entities.length) {
      throw new Error('найдены не все элементы');
    }

    return new Map(
      entities.map(item => [item.id, Status.createFromReadEntity(item)]),
    );
  }

  async getProjectionsMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, Status>> {
    // const productBatchReadRepo = queryRunner.manager.withRepository(
    //   this.productBatchReadRepo,
    // );
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );

    const eventEntitiesByAggregateIdMap =
      await statusEventRepo.findManyByAggregateId(ids);

    return new Map(
      [...eventEntitiesByAggregateIdMap.entries()].map(
        ([id, eventEntities]) => [
          id,
          Status.buildProjection(eventEntities as StatusEvent[]),
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
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );

    const eventEntities = await statusEventRepo.find({
      where: {
        requestId: rolledBackRequestId,
      },
      order: { revision: 'asc' },
    });
    const rolledBackEventsByAggregateIdMap = new Map<
      number,
      StatusEventEntity[]
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
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );
    const eventEntities = await statusEventRepo.find({
      where: {
        requestId: lastRollbackRequestId,
      },
      relations: ['rollbackTarget'],
    });

    const revertedEventsByAggregateIdMap = new Map<
      number,
      StatusEventEntity[]
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
        aggregate.revertEvent(event as StatusRollbackEvent);
      });
      aggregate.rebuild();
    });

    await this.saveAggregates({
      aggregates: [...aggregateMap.values()],
      requestId,
      queryRunner,
    });

    await statusEventRepo.delete({
      requestId: lastRollbackRequestId,
    });
  }
}
