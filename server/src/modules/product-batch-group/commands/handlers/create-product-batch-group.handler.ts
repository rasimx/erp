import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchEventStore } from '@/product-batch/prodict-batch.eventstore.js';
import { CreateProductBatchGroupCommand } from '@/product-batch-group/commands/impl/create-product-batch-group.command.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(CreateProductBatchGroupCommand)
export class CreateProductBatchGroupHandler
  implements ICommandHandler<CreateProductBatchGroupCommand>
{
  constructor(
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: CreateProductBatchGroupCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchGroupRepository,
      );

      const entity = await productBatchRepository.createFromDto(dto);
      // await this.productBatchEventStore.createProductBatch(entity.id, dto);
      // if (dto.parentId) {
      //   // todo: если вдруг второй ивент упадет с ошибкой. нужно предыдущее отменить
      //   await this.productBatchEventStore.moveProductBatchItems({
      //     donorId: dto.parentId,
      //     count: dto.count,
      //     recipientId: entity.id,
      //   });
      // }

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
