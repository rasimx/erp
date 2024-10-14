import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductEventRepo } from '@/product/domain/product.event-repo.js';
import type { ProductBatchEventEntity } from '@/product-batch/domain/product-batch.event-entity.js';
import { ProductBatchEventRepo } from '@/product-batch/domain/product-batch.event-repo.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { RequestRepository } from '@/request/request.repository.js';

import { RevertCommand } from './revert.command.js';

@CommandHandler(RevertCommand)
export class RevertHandler implements ICommandHandler<RevertCommand> {
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly requestRepo: RequestRepository,
    private readonly contextService: ContextService,
    private readonly productEventRepo: ProductEventRepo,
    private readonly productBatchRepo: ProductBatchReadRepo,
    private readonly productBatchEventRepo: ProductBatchEventRepo,
    // private readonly operationService: OperationService,
    // private readonly requestRepo: RequestRepository,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: RevertCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);

      const productEventRepo = queryRunner.manager.withRepository(
        this.productEventRepo,
      );
      const productBatchEventRepo = queryRunner.manager.withRepository(
        this.productBatchEventRepo,
      );
      const productBatchRepo = queryRunner.manager.withRepository(
        this.productBatchRepo,
      );

      const lastRollbackRequest = await requestRepo.findLastRequest();

      // await requestRepo.insert({
      //   id: requestId,
      // });

      // if (lastRollbackRequest.rollbackTargetId) {
      //   const events = await productBatchEventRepo.find({
      //     where: {
      //       requestId: lastRollbackRequest.id,
      //     },
      //   });
      //
      //   await productBatchEventRepo.delete({
      //     requestId: lastRollbackRequest.id,
      //   });
      //
      //   await requestRepo.remove(lastRollbackRequest);
      //
      //   const productBatchMap = await this.productBatchFactory.getManyProjection({
      //     ids: events.map(item => item.aggregateId),
      //     queryRunner,
      //   });
      //
      //   await this.productBatchService.saveAggregates({
      //     aggregates: [...productBatchMap.values()].flatMap(item =>
      //       item ? [item] : [],
      //     ),
      //     requestId,
      //     queryRunner,
      //   });
      // }

      // await productBatchRepo.delete({
      //   id: In(
      //     [...productBatchMap.entries()]
      //       .filter(([id, item]) => !item)
      //       .map(([id]) => id),
      //   ),
      // });

      // await requestRepo.insert({ id: requestId });

      // const lastEvent = await requestRepo.findOne({
      //   relations: ['rollback'],
      //   where: { rollbackOf: IsNull(), rollback: null },
      //   order: { id: 'ASC' },
      // });

      // throw new Error('sss');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
