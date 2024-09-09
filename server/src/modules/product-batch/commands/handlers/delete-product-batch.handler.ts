import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

import { DeleteProductBatchCommand } from '../impl/delete-product-batch.command.js';

@CommandHandler(DeleteProductBatchCommand)
export class DeleteProductBatchHandler
  implements ICommandHandler<DeleteProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: DeleteProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id } = command;
      const transactionalProductBatchRepository =
        queryRunner.manager.withRepository(this.productBatchRepository);

      await transactionalProductBatchRepository.softDelete({ id });

      await this.productBatchService.relinkPostings({
        queryRunner,
        deletedIds: [id],
      });

      const { appendResult } =
        await this.productBatchEventStore.deleteProductBatch({
          eventId: requestId,
          productBatchId: id,
        });

      if (!appendResult.success) throw new Error('????');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
