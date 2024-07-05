import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { CreateProductBatchCommand } from '@/product-batch/commands/impl/create-product-batch.command.js';
import { ProductBatchEventStore } from '@/product-batch/prodict-batch.eventstore.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';

@CommandHandler(CreateProductBatchCommand)
export class CreateProductBatchHandler
  implements ICommandHandler<CreateProductBatchCommand>
{
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: CreateProductBatchCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;
      const productBatchRepository = queryRunner.manager.withRepository(
        this.productBatchRepository,
      );

      const entity = await productBatchRepository.createFromDto(dto);
      await this.productBatchEventStore.createProductBatch(entity.id, dto);
      if (dto.parentId) {
        // todo: если вдруг второй ивент упадет с ошибкой. нужно предыдущее отменить
        await this.productBatchEventStore.moveProductBatchItems({
          donorId: dto.parentId,
          count: dto.count,
          recipientId: entity.id,
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
