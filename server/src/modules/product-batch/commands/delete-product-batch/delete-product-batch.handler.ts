import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import pick from 'lodash/pick.js';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
// import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

import { DeleteProductBatchCommand } from './delete-product-batch.command.js';

@CommandHandler(DeleteProductBatchCommand)
export class DeleteProductBatchHandler
  implements ICommandHandler<DeleteProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchReadRepo,
    // private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: DeleteProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const cancels: (() => Promise<void>)[] = [];

    throw new Error('как удалять если есть source');

    // try {
    //   const { id } = command;
    //   const transactionalProductBatchRepository =
    //     queryRunner.manager.withRepository(this.productBatchRepository);
    //
    //   const productBatch =
    //     await transactionalProductBatchRepository.findOneOrFail({
    //       where: { id },
    //     });
    //
    //   await transactionalProductBatchRepository.softDelete({ id });
    //
    //   await this.productBatchService.relinkPostings({
    //     queryRunner,
    //     deletedIds: [id],
    //   });
    //
    //   const eventData = pick(productBatch, ['id', 'count']);
    //   const { appendResult, cancel } =
    //     await this.productBatchEventStore.appendProductBatchDeletedEvent({
    //       eventId: requestId,
    //       data: eventData,
    //     });
    //   if (!appendResult.success) throw new Error('????');
    //   cancels.push(cancel);
    //
    //   const { appendResult: productAppendResult, cancel: productCancel } =
    //     await this.productEventStore.appendProductBatchDeletedEvent({
    //       eventId: requestId,
    //       productId: productBatch.productId,
    //       data: eventData,
    //     });
    //
    //   if (!productAppendResult.success) throw new Error('????');
    //
    //   await queryRunner.commitTransaction();
    // } catch (err) {
    //   await queryRunner.rollbackTransaction();
    //   for (const cancel of cancels) {
    //     await cancel();
    //   }
    //   throw err;
    // } finally {
    //   // you need to release a queryRunner which was manually instantiated
    //   await queryRunner.release();
    // }
  }
}
