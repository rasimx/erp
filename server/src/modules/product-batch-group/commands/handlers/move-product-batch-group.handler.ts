import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchEventStore } from '@/product-batch/prodict-batch.eventstore.js';
import type { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { MoveProductBatchGroupCommand } from '@/product-batch-group/commands/impl/move-product-batch-group.command.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(MoveProductBatchGroupCommand)
export class MoveProductBatchGroupHandler
  implements ICommandHandler<MoveProductBatchGroupCommand>
{
  constructor(
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: MoveProductBatchGroupCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      // await this.productBatchEventStore.moveProductBatch(dto);
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchGroupRepository,
      );

      const { statusId, oldStatusId, order, oldOrder } =
        await productBatchRepository.moveProductBatchGroup(dto);
      await this.productBatchRepository.moveOthersByStatus({
        statusId,
        oldStatusId,
        order,
        oldOrder,
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
}
