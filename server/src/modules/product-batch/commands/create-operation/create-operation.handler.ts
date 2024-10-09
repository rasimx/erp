import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OperationService } from '@/operation/operation.service.js';
import type { RevisionProductBatchEvent } from '@/product-batch/domain/product-batch.events.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { RequestRepository } from '@/request/request.repository.js';

import { CreateOperationCommand } from './create-operation.command.js';

@CommandHandler(CreateOperationCommand)
export class CreateOperationHandler
  implements ICommandHandler<CreateOperationCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly operationService: OperationService,
    private readonly requestRepo: RequestRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly productBatchEventRepo: ProductBatchEventRepository,
  ) {}

  async execute(command: CreateOperationCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const { dto } = command;

    const queryRunner = this.dataSource.createQueryRunner();

    const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
    const request = await requestRepo.insert({ id: requestId });

    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const operations = await this.operationService.createOperations(
        [dto],
        queryRunner,
      );

      const operation = operations[0];

      const targetEvents = await productBatchEventRepo.findByAggregateId(
        dto.productBatchId,
      );
      const productBatch = ProductBatch.buildFromEvents(
        targetEvents as RevisionProductBatchEvent[],
      );

      productBatch.appendOperation({ ...dto, id: operation.id });

      await productBatchEventRepo.saveAggregateEvents({
        aggregates: [productBatch],
        requestId,
      });

      await productBatchRepo.save(productBatch.toObject());

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
