import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchEventStore } from '@/product-batch/prodict-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';

import { DeleteProductBatchCommand } from '../impl/delete-product-batch.command.js';

@CommandHandler(DeleteProductBatchCommand)
export class DeleteProductBatchHandler
  implements ICommandHandler<DeleteProductBatchCommand>
{
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: DeleteProductBatchCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id } = command;
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      await productBatchRepository.softDelete({ id });

      await this.productBatchEventStore.deleteProductBatch(id);

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
