import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import { CreateStatusCommand } from '@/status/commands/create-status/create-status.command.js';
import { StatusEventRepo } from '@/status/domain/status.event-repo.js';
import { Status } from '@/status/domain/status.js';
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
      aggregates.map(item => item.toObject()),
    );
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
      relations: ['product'],
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
}
