import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';

import { CreateProductBatchGroupCommand } from './create-product-batch-group.command.js';

@CommandHandler(CreateProductBatchGroupCommand)
export class CreateProductBatchGroupHandler
  implements ICommandHandler<CreateProductBatchGroupCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly productBatchGroupService: ProductBatchGroupService,
  ) {}

  async execute(command: CreateProductBatchGroupCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { dto } = command;

      await this.productBatchGroupService.create({
        dto,
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
