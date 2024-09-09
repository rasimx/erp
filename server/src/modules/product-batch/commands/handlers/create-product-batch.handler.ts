import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { CreateProductBatchCommand } from '@/product-batch/commands/impl/create-product-batch.command.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@CommandHandler(CreateProductBatchCommand)
export class CreateProductBatchHandler
  implements ICommandHandler<CreateProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: CreateProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      const affectedIds: number[] = [];
      const newEntity = await productBatchRepository.createNew(dto);
      affectedIds.push(newEntity.id);

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds,
      });

      const { appendResult, cancel } =
        await this.productBatchEventStore.appendProductBatchCreatedEvent({
          eventId: requestId,
          data: {
            id: newEntity.id,
            count: newEntity.count,
            productId: newEntity.productId,
            groupId: newEntity.groupId,
            operationsPrice: newEntity.operationsPrice,
            operationsPricePerUnit: newEntity.operationsPricePerUnit,
            statusId: newEntity.statusId,
            costPricePerUnit: newEntity.costPricePerUnit,
          },
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
