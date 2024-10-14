import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductEventRepo } from '@/product/domain/product.event-repo.js';
import { ProductBatchEventRepo } from '@/product-batch/domain/product-batch.event-repo.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { RequestRepository } from '@/request/request.repository.js';

import { RollbackCommand } from './rollback.command.js';

@CommandHandler(RollbackCommand)
export class RollbackHandler implements ICommandHandler<RollbackCommand> {
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

  async execute(command: RollbackCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);

      const lastNonRolledBackRequestId =
        await requestRepo.findLastNonRolledBackId();

      await requestRepo.insert({
        id: requestId,
        rollbackTargetId: lastNonRolledBackRequestId,
      });

      if (lastNonRolledBackRequestId) {
        await this.productBatchService.rollbackProductBatches({
          requestId,
          rolledBackRequestId: lastNonRolledBackRequestId,
          queryRunner,
        });
      }

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
