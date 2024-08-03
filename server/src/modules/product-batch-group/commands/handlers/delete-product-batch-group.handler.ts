import { CommandBus, CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import { DeleteProductBatchCommand } from '@/product-batch/commands/impl/delete-product-batch.command.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { DeleteProductBatchGroupCommand } from '@/product-batch-group/commands/impl/delete-product-batch-group.command.js';
import { ProductBatchGroupEventStore } from '@/product-batch-group/prodict-batch-group.eventstore.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(DeleteProductBatchGroupCommand)
export class DeleteProductBatchGroupHandler
  implements ICommandHandler<DeleteProductBatchGroupCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private commandBus: CommandBus,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchGroupEventStore: ProductBatchGroupEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: DeleteProductBatchGroupCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id } = command;
      const productBatchGroupRepository = queryRunner.manager.withRepository(
        this.productBatchGroupRepository,
      );

      const entity = await productBatchGroupRepository.findOneOrFail({
        where: { id },
        relations: ['productBatchList'],
      });
      for (const productBatchEntity of entity.productBatchList) {
        await this.commandBus.execute(
          new DeleteProductBatchCommand(productBatchEntity.id),
        );
      }

      await productBatchGroupRepository.softDelete({ id });

      await this.productBatchService.relinkPostings({
        queryRunner,
        deletedGroupIds: [id],
      });

      // eventStore
      await this.productBatchGroupEventStore.deleteProductBatchGroup({
        eventId: requestId,
        productBatchGroupId: entity.id,
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
