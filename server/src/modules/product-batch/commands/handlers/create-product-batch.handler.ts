import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { CreateProductBatchCommand } from '@/product-batch/commands/impl/create-product-batch.command.js';
import { ProductBatchEventStore } from '@/product-batch/product-batch.eventstore.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';

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

      const entity = await productBatchRepository.createFromDto(dto);
      await this.productBatchEventStore.createProductBatch({
        eventId: requestId,
        productBatchId: entity.id,
        dto,
      });
      if (dto.parentId) {
        // todo: если вдруг второй ивент упадет с ошибкой. нужно предыдущее отменить
        await this.productBatchEventStore.moveProductBatchItems({
          eventId: requestId,
          dto: {
            donorId: dto.parentId,
            count: dto.count,
            recipientId: entity.id,
          },
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
