import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import pick from 'lodash/pick.js';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductEventStore } from '@/product/eventstore/product.eventstore.js';
import { CreateProductBatchCommand } from '@/product-batch/commands/impl/create-product-batch.command.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import type { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupEventStore } from '@/product-batch-group/eventstore/prodict-batch-group.eventstore.js';
import type { ProductBatchGroupEntity } from '@/product-batch-group/product-batch-group.entity.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(CreateProductBatchCommand)
export class CreateProductBatchHandler
  implements ICommandHandler<CreateProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly productEventStore: ProductEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchGroupEventStore: ProductBatchGroupEventStore,
  ) {}

  async execute(command: CreateProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const productBatchRepository = queryRunner.manager.withRepository(
      this.productBatchRepository,
    );

    const productBatchGroupRepository = queryRunner.manager.withRepository(
      this.productBatchGroupRepository,
    );

    const cancels: (() => Promise<void>)[] = [];

    try {
      const { dto } = command;

      let newGroup: ProductBatchGroupEntity | undefined;

      if (dto.grouped) {
        if (!dto.statusId) throw new Error('dto.statusId was not defined');
        if (!dto.groupName) throw new Error('dto.groupName was not defined');

        newGroup = await productBatchGroupRepository.createFromDto({
          name: dto.groupName,
          statusId: dto.statusId,
          existProductBatchIds: [],
        });

        dto.statusId = null;
        dto.groupId = newGroup.id;
      }

      const affectedIds: number[] = [];

      const newEntities: ProductBatchEntity[] = [];

      for (const item of dto.items) {
        const newEntity = await productBatchRepository.createNew({
          ...dto,
          ...item,
        });
        newEntities.push(newEntity);
        affectedIds.push(newEntity.id);
      }

      await this.productBatchService.relinkPostings({
        queryRunner,
        affectedIds,
      });

      if (newGroup) {
        const { appendResult, cancel } =
          await this.productBatchGroupEventStore.appendProductBatchGroupCreatedEvent(
            {
              eventId: requestId,
              data: {
                id: newGroup.id,
                name: newGroup.name,
                statusId: newGroup.statusId,
                existProductBatchIds: newEntities.map(({ id }) => id),
              },
            },
          );

        if (!appendResult.success) throw new Error('????');
        cancels.push(cancel);
      }

      for (const newEntity of newEntities) {
        const eventData = pick(newEntity, [
          'id',
          'count',
          'productId',
          'groupId',
          'operationsPrice',
          'operationsPricePerUnit',
          'statusId',
          'costPricePerUnit',
          'currencyCostPricePerUnit',
          'exchangeRate',
        ]);

        const { appendResult, cancel } =
          await this.productBatchEventStore.appendProductBatchCreatedEvent({
            eventId: requestId,
            data: eventData,
          });
        if (!appendResult.success) throw new Error('????');
        cancels.push(cancel);

        const { appendResult: productAppendResult, cancel: productCancel } =
          await this.productEventStore.appendProductBatchCreatedEvent({
            eventId: requestId,
            productId: newEntity.productId,
            data: eventData,
          });

        if (!productAppendResult.success) throw new Error('????');
      }

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
