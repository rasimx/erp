import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { RequestRepository } from '@/request/request.repository.js';

import { CreateProductBatchesFromSourcesCommand } from './create-product-batches-from-sources.command.js';

@CommandHandler(CreateProductBatchesFromSourcesCommand)
export class CreateProductBatchesFromSourcesHandler
  implements ICommandHandler<CreateProductBatchesFromSourcesCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly requestRepo: RequestRepository,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: CreateProductBatchesFromSourcesCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
    await requestRepo.insert({ id: requestId });

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { dto } = command;

      await this.productBatchService.createFromSources({
        requestId,
        dto,
        queryRunner,
      });

      // await this.productBatchService.relinkPostings({
      //   queryRunner,
      //   affectedIds,
      // });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
