import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/impl/move-product-batch.command.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(MoveProductBatchCommand)
export class MoveProductBatchHandler
  implements ICommandHandler<MoveProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: MoveProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      const transactionalProductBatchRepository =
        queryRunner.manager.withRepository(this.productBatchRepository);

      const transactionalProductBatchGroupRepository =
        queryRunner.manager.withRepository(this.productBatchGroupRepository);

      const {
        id,
        statusId,
        oldStatusId,
        oldOrder,
        order: newOrder,
        affectedIds,
      } = await transactionalProductBatchRepository.moveProductBatch(dto);
      let affectedGroupIds: number[] | undefined;
      if (statusId && oldStatusId) {
        affectedGroupIds =
          await transactionalProductBatchGroupRepository.moveOthers({
            statusId,
            oldStatusId,
            order: newOrder,
            oldOrder,
          });
      }

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds: [id, ...affectedIds],
        affectedGroupIds,
      });

      // eventStore
      const { appendResult } =
        await this.productBatchEventStore.moveProductBatch({
          eventId: requestId,
          data: dto,
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
