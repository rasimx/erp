import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import pick from 'lodash/pick.js';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductEventStore } from '@/product/eventstore/product.eventstore.js';
import { EditProductBatchCommand } from '@/product-batch/commands/impl/edit-product-batch.command.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@CommandHandler(EditProductBatchCommand)
export class EditProductBatchHandler
  implements ICommandHandler<EditProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly productEventStore: ProductEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: EditProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const cancels: (() => Promise<void>)[] = [];

    try {
      const { dto } = command;
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      const affectedIds: number[] = [];
      let entity = await productBatchRepository.findOneOrFail({
        where: { id: dto.id },
      });

      // todo: обработать нуль
      if (dto.count == 0) throw new Error('не может быть нулем');

      entity.count = dto.count;

      entity = await productBatchRepository.save(entity);

      affectedIds.push(entity.id);

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds,
      });

      const { appendResult, cancel } =
        await this.productBatchEventStore.appendProductBatchEditedEvent({
          eventId: requestId,
          data: dto,
        });
      if (!appendResult.success) throw new Error('????');
      cancels.push(cancel);

      // todo: если меняется количество - добавляем событие в product, иначе наверно не стоит
      const { appendResult: productAppendResult, cancel: productCancel } =
        await this.productEventStore.appendProductBatchEditedEvent({
          eventId: requestId,
          productId: entity.productId,
          data: dto,
        });

      if (!productAppendResult.success) throw new Error('????');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      for (const cancel of cancels) {
        await cancel();
      }
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
