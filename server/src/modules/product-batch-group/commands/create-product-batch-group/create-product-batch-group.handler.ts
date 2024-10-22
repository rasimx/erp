import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { RequestRepository } from '@/request/request.repository.js';

import { CreateProductBatchGroupCommand } from './create-product-batch-group.command.js';

@CommandHandler(CreateProductBatchGroupCommand)
export class CreateProductBatchGroupHandler
  implements ICommandHandler<CreateProductBatchGroupCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly requestRepo: RequestRepository,
    private readonly productBatchGroupService: ProductBatchGroupService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: CreateProductBatchGroupCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { dto } = command;

      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const newGroup = await this.productBatchGroupService.create({
        dto,
        requestId,
        queryRunner,
      });

      const { existProductBatchIds } = dto;

      const productBatchMap = await this.productBatchService.getReadModelMap({
        ids: existProductBatchIds,
        queryRunner,
      });

      [...productBatchMap.values()]
        .toSorted((a, b) => a.getOrder() - b.getOrder())
        .forEach((item, index) => {
          item.move({ groupId: newGroup.id, order: index + 1, statusId: null });
        });

      await this.productBatchService.saveAggregates({
        aggregates: [...productBatchMap.values()],
        requestId,
        queryRunner,
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
