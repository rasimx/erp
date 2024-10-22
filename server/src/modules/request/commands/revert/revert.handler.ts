import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductEventRepo } from '@/product/domain/product.event-repo.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchEventRepo } from '@/product-batch/domain/product-batch.event-repo.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { RequestRepository } from '@/request/request.repository.js';
import { StatusService } from '@/status/status.service.js';

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
    private readonly productService: ProductService,
    private readonly productBatchService: ProductBatchService,
    private readonly productBatchGroupService: ProductBatchGroupService,
    private readonly statusService: StatusService,
  ) {}

  async execute(command: RevertCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);

      const lastRollbackRequest = await requestRepo.findLastRequest();

      if (lastRollbackRequest.rollbackTargetId) {
        await this.productService.revert({
          lastRollbackRequestId: lastRollbackRequest.id,
          requestId,
          queryRunner,
        });
        await this.productBatchGroupService.revert({
          lastRollbackRequestId: lastRollbackRequest.id,
          requestId,
          queryRunner,
        });
        await this.productBatchService.revert({
          lastRollbackRequestId: lastRollbackRequest.id,
          requestId,
          queryRunner,
        });
        await this.statusService.revert({
          lastRollbackRequestId: lastRollbackRequest.id,
          requestId,
          queryRunner,
        });
        await requestRepo.remove(lastRollbackRequest);
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
