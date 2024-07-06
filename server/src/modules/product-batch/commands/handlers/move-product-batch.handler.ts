import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/impl/move-product-batch.command.js';
import { ProductBatchEventStore } from '@/product-batch/prodict-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(MoveProductBatchCommand)
export class MoveProductBatchHandler
  implements ICommandHandler<MoveProductBatchCommand>
{
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: MoveProductBatchCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      await this.productBatchEventStore.moveProductBatch(dto);
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      const {
        statusId,
        oldStatusId,
        oldOrder,
        order: newOrder,
      } = await productBatchRepository.moveProductBatch(dto);
      if (statusId ?? oldStatusId) {
        await this.productBatchGroupRepository.moveOthers({
          statusId,
          oldStatusId,
          order: newOrder,
          oldOrder,
        });
      }

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
