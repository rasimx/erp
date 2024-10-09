import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { CreateStatusCommand } from '@/status/commands/create-status/create-status.command.js';
import type { RevisionStatusEvent } from '@/status/domain/status.events.js';
import { Status } from '@/status/domain/status.js';
import { StatusRepository } from '@/status/domain/status.repository.js';
import { StatusEventRepository } from '@/status/domain/status-event.repository.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import type { StatusDto } from '@/status/dtos/status.dto.js';
import { GetStatusListQuery } from '@/status/queries/get-status-list/get-status-list.query.js';

@Injectable()
export class StatusService {
  constructor(
    private readonly contextService: ContextService,
    private readonly statusRepo: StatusRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly statusEventRepo: StatusEventRepository,
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

      return this.a();
    });
  }

  async a() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const statusRepo = queryRunner.manager.withRepository(this.statusRepo);
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );

    try {
      const entities = await statusRepo.find();

      const aggregates = entities.map(entity => {
        return Status.create({
          id: entity.id,
          type: entity.type,
          title: entity.title,
          order: entity.order,
          storeId: entity.storeId,
        });
      });

      await statusEventRepo.saveAggregateEvents({
        aggregates,
        requestId: '01927037-a31c-7556-91a5-b21a9b6d3b34',
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  buildFromEvents(args: {
    id: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, Status>>;
  buildFromEvents(args: {
    id: number;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Status>;
  async buildFromEvents({
    id,
    queryRunner,
  }: {
    id: number[] | number;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, Status> | Status> {
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );

    if (Array.isArray(id)) {
      const events = await statusEventRepo.findManyByAggregateId(id);

      return new Map(
        [...events.entries()].map(([aggregateId, events]) => [
          aggregateId,
          Status.buildFromEvents(events as RevisionStatusEvent[]),
        ]),
      );
    }
    const events = await statusEventRepo.findByAggregateId(id);

    return Status.buildFromEvents(events as RevisionStatusEvent[]);
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
    const statusRepo = queryRunner.manager.withRepository(this.statusRepo);
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );

    const events = await statusEventRepo.saveAggregateEvents({
      aggregates,
      requestId,
    });

    const entities = await statusRepo.save(
      aggregates.map(item => item.toObject()),
    );
    return { events, entities };
  }
}
