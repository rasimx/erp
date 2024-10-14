import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OperationService } from '@/operation/operation.service.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { RequestRepository } from '@/request/request.repository.js';

import { AddOperationCommand } from './add-operation.command.js';

@CommandHandler(AddOperationCommand)
export class AddOperationHandler
  implements ICommandHandler<AddOperationCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly operationService: OperationService,
    private readonly requestRepo: RequestRepository,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: AddOperationCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const { dto } = command;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      let productBatch = await this.productBatchService.getReadModel({
        id: dto.productBatchId,
        queryRunner,
      });

      const aggregates: ProductBatch[] = [];

      const newChildBatch =
        await this.productBatchService.shouldSplitAndReturnNewChild({
          productBatch,
          queryRunner,
        });

      if (newChildBatch) {
        aggregates.push(productBatch);
        productBatch = newChildBatch;
      }

      const operations = await this.operationService.createOperations(
        [{ ...dto, productBatchId: productBatch.id }],
        queryRunner,
      );

      const operation = operations[0];

      productBatch.addOperation({ ...dto, id: operation.id });

      aggregates.push(productBatch);

      await this.productBatchService.saveAggregates({
        aggregates,
        requestId,
        queryRunner,
      });

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
