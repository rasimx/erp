import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import pick from 'lodash/pick.js';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { CreateProductBatchesFromSourcesCommand } from '@/product-batch/commands/impl/create-product-batches-from-sources.command.js';
import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import type { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupEventStore } from '@/product-batch-group/eventstore/prodict-batch-group.eventstore.js';
import type { ProductBatchGroupEntity } from '@/product-batch-group/product-batch-group.entity.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@CommandHandler(CreateProductBatchesFromSourcesCommand)
export class CreateProductBatchesFromSourcesHandler
  implements ICommandHandler<CreateProductBatchesFromSourcesCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productBatchEventStore: ProductBatchEventStore,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchGroupEventStore: ProductBatchGroupEventStore,
  ) {}

  async execute(command: CreateProductBatchesFromSourcesCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    const productBatchRepository = queryRunner.manager.withRepository(
      this.productBatchRepository,
    );

    const productBatchGroupRepository = queryRunner.manager.withRepository(
      this.productBatchGroupRepository,
    );

    await queryRunner.connect();
    await queryRunner.startTransaction();
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

      let newEntities: ProductBatchEntity[] = [];

      for (const sourceItem of dto.sources) {
        const { newEntity, sourceBatch } =
          await productBatchRepository.createFromSources({
            ...dto,
            productId: sourceItem.productId,
            selectedCount: sourceItem.selectedCount,
            sourceId: sourceItem.id,
          });

        newEntities.push(newEntity);
        affectedIds.push(newEntity.id, sourceBatch.id);
      }

      newEntities = await productBatchRepository.find({
        where: { id: In(newEntities.map(({ id }) => id)) },
        relations: ['sourcesClosure', 'destinationsClosure'],
      });

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

      for (const entity of newEntities) {
        const { appendResult, cancel } =
          await this.productBatchEventStore.appendProductBatchCreatedFromSourceEvent(
            {
              eventId: requestId,
              data: {
                ...pick(entity, [
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
                ]),
                sourceId: entity.sourcesClosure[0].sourceId,
              },
            },
          );

        if (!appendResult.success) throw new Error('????');
        cancels.push(cancel);

        await Promise.all(
          entity.sourcesClosure.map(async item => {
            const { appendResult, cancel } =
              await this.productBatchEventStore.appendMoveProductsToChildBatchEvent(
                {
                  eventId: requestId,
                  data: {
                    id: item.sourceId,
                    count: item.count,
                    destinationID: item.destinationId,
                  },
                },
              );
            cancels.push(cancel);
            if (!appendResult.success) throw new Error('????');
          }),
        );
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
