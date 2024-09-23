import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { MoveProductBatchGroupCommand } from '@/product-batch-group/commands/impl/move-product-batch-group.command.js';
import { ProductBatchGroupEventStore } from '@/product-batch-group/eventstore/prodict-batch-group.eventstore.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(MoveProductBatchGroupCommand)
export class MoveProductBatchGroupHandler
  implements ICommandHandler<MoveProductBatchGroupCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchGroupEventStore: ProductBatchGroupEventStore,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: MoveProductBatchGroupCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      const productBatchGroupRepository = queryRunner.manager.withRepository(
        this.productBatchGroupRepository,
      );

      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      const { id, statusId, oldStatusId, order, oldOrder, affectedGroupIds } =
        await productBatchGroupRepository.moveProductBatchGroup(dto);
      const affectedIds = await productBatchRepository.moveOthersByStatus({
        statusId,
        oldStatusId,
        order,
        oldOrder,
      });

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds,
        affectedGroupIds: [id, ...affectedGroupIds],
      });

      // eventStore
      const { appendResult, cancel } =
        await this.productBatchGroupEventStore.appendProductBatchGroupMovedEvent(
          {
            eventId: requestId,
            data: dto,
          },
        );

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
