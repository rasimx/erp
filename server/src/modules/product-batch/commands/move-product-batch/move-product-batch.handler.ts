import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNil } from '@/common/helpers/utils.js';
import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/move-product-batch/move-product-batch.command.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
// import { ProductBatchEventStore } from '@/product-batch/eventstore/product-batch.eventstore.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import type { RevisionProductBatchGroupEvent } from '@/product-batch-group/domain/product-batch-group.events.js';
import { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/domain/product-batch-group.repository.js';
import { ProductBatchGroupEventRepository } from '@/product-batch-group/domain/product-batch-group-event.repository.js';
import { RequestRepository } from '@/request/request.repository.js';

@CommandHandler(MoveProductBatchCommand)
export class MoveProductBatchHandler
  implements ICommandHandler<MoveProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly requestRepo: RequestRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly productBatchGroupRepo: ProductBatchGroupRepository,
    private readonly productBatchGroupEventRepo: ProductBatchGroupEventRepository,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: MoveProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      const productBatchRepo = queryRunner.manager.withRepository(
        this.productBatchRepo,
      );

      const productBatchGroupRepo = queryRunner.manager.withRepository(
        this.productBatchGroupRepo,
      );
      const productBatchGroupEventRepo = queryRunner.manager.withRepository(
        this.productBatchGroupEventRepo,
      );

      let productBatch = await this.productBatchService.buildFromEvents({
        id: dto.id,
        queryRunner,
      });
      const aggregates: ProductBatch[] = [];

      const newChildBatch =
        await this.productBatchService.shouldSplitAndReturnNewChild({
          productBatch,
          queryRunner,
        });

      if (newChildBatch) {
        aggregates.push(productBatch);
        productBatch = newChildBatch;
      }

      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      const request = await requestRepo.insert({ id: requestId });

      const otherItems: { id: number; order: number }[] = [];
      const otherGroups: { id: number; order: number }[] = [];

      const {
        order: oldOrder,
        statusId: oldStatusId,
        groupId: oldGroupId,
      } = productBatch.toObject();

      let order = 1;

      if (!isNil(dto.groupId)) {
        const lastOrderInGroup = await productBatchRepo.getLastOrderInGroup(
          dto.groupId,
        );

        const maxOrder =
          oldGroupId === dto.groupId
            ? lastOrderInGroup || 1
            : lastOrderInGroup
              ? lastOrderInGroup + 1
              : 1;
        order = dto.order ? Math.min(dto.order, maxOrder) : maxOrder;

        // const groupEvents = await productBatchGroupEventRepo.getAllEvents(
        //   dto.groupId,
        // );
        // const group = ProductBatchGroup.buildFromEvents(
        //   groupEvents as ProductBatchGroupEvent[],
        // );
        //

        if (dto.groupId === oldGroupId) {
          // внутри группы
          const minOrder = Math.min(order, oldOrder);

          let offset = 0;
          (
            await productBatchRepo.getIdsInGroupMoreThanOrEqualOrder({
              groupId: dto.groupId,
              order: minOrder,
            })
          )
            .filter(id => id != dto.id)
            .forEach((id, index) => {
              if (order == minOrder + index) {
                offset++;
              }
              otherItems.push({ id, order: minOrder + index + offset });
            });
        } else {
          // перенос из сторонней группы или колонки
          if (lastOrderInGroup && order <= lastOrderInGroup) {
            const idsInNewGroup =
              await productBatchRepo.getIdsInGroupMoreThanOrEqualOrder({
                groupId: dto.groupId,
                order,
              });

            idsInNewGroup.forEach((id, index) => {
              otherItems.push({ id, order: order + index + 1 });
            });
          }
          // обновить порядок в старой группе
          if (!isNil(oldGroupId)) {
            const idsInOldGroup = (
              await productBatchRepo.getIdsInGroupMoreThanOrEqualOrder({
                groupId: oldGroupId,
                order: oldOrder,
              })
            ).filter(id => id != dto.id);

            idsInOldGroup.forEach((id, index) => {
              otherItems.push({ id, order: oldOrder + index });
            });
          }
          // обновить порядок в старой колонке
          if (!isNil(oldStatusId)) {
            const entitiesInOldStatus = (
              await productBatchRepo.getEntitiesInStatusMoreThanOrEqualOrder({
                statusId: oldStatusId,
                order: oldOrder,
              })
            ).filter(
              item => !(item.entity == 'product_batch' && item.id == dto.id),
            );

            entitiesInOldStatus.forEach((item, index) => {
              if (item.entity == 'product_batch') {
                otherItems.push({ id: item.id, order: oldOrder + index });
              }
              if (item.entity == 'product_batch_group') {
                otherGroups.push({ id: item.id, order: oldOrder + index });
              }
            });
          }
        }
      } else if (!isNil(dto.statusId)) {
        const lastOrderInStatus = await productBatchRepo.getLastOrderInStatus(
          dto.statusId,
        );

        const maxOrder =
          oldStatusId === dto.statusId
            ? lastOrderInStatus || 1
            : lastOrderInStatus
              ? lastOrderInStatus + 1
              : 1;
        order = dto.order ? Math.min(dto.order, maxOrder) : maxOrder;

        if (dto.statusId === oldStatusId) {
          const minOrder = Math.min(order, oldOrder);

          const entitiesInStatus = (
            await productBatchRepo.getEntitiesInStatusMoreThanOrEqualOrder({
              statusId: oldStatusId,
              order: minOrder,
            })
          ).filter(
            item => !(item.entity == 'product_batch' && item.id == dto.id),
          );

          let offset = 0;

          entitiesInStatus.forEach((item, index) => {
            if (order == minOrder + index) {
              offset++;
            }
            if (item.entity == 'product_batch') {
              otherItems.push({
                id: item.id,
                order: minOrder + index + offset,
              });
            }
            if (item.entity == 'product_batch_group') {
              otherGroups.push({
                id: item.id,
                order: minOrder + index + offset,
              });
            }
          });
        } else {
          // перенос из сторонней группы или колонки
          if (lastOrderInStatus && order <= lastOrderInStatus) {
            const entitiesInNewStatus =
              await productBatchRepo.getEntitiesInStatusMoreThanOrEqualOrder({
                statusId: dto.statusId,
                order,
              });

            entitiesInNewStatus.forEach((item, index) => {
              if (item.entity == 'product_batch') {
                otherItems.push({ id: item.id, order: order + index + 1 });
              }
              if (item.entity == 'product_batch_group') {
                otherGroups.push({ id: item.id, order: order + index + 1 });
              }
            });
          }
          // обновить порядок в старой группе
          if (!isNil(oldGroupId)) {
            const idsInOldGroup = (
              await productBatchRepo.getIdsInGroupMoreThanOrEqualOrder({
                groupId: oldGroupId,
                order: oldOrder,
              })
            ).filter(id => id != dto.id);

            idsInOldGroup.forEach((id, index) => {
              otherItems.push({ id, order: oldOrder + index });
            });
          }
          // обновить порядок в старой колонке
          if (!isNil(oldStatusId)) {
            const entitiesInOldStatus = (
              await productBatchRepo.getEntitiesInStatusMoreThanOrEqualOrder({
                statusId: oldStatusId,
                order: oldOrder,
              })
            ).filter(
              item => !(item.entity == 'product_batch' && item.id == dto.id),
            );

            entitiesInOldStatus.forEach((item, index) => {
              if (item.entity == 'product_batch') {
                otherItems.push({ id: item.id, order: oldOrder + index });
              }
              if (item.entity == 'product_batch_group') {
                otherGroups.push({ id: item.id, order: oldOrder + index });
              }
            });
          }
        }

        // const lastOrderInStatus = await productBatchRepo.getLastOrderInStatus(
        //   dto.statusId,
        // );
      } else {
        throw new Error('statusId or groupId must be defined');
      }

      productBatch.move({
        ...dto,
        order,
      });

      // save productBatches
      const productBatchMap = await this.productBatchService.buildFromEvents({
        queryRunner,
        id: otherItems.map(item => item.id),
      });
      otherItems.forEach(({ id, order }) => {
        const productBatch = productBatchMap.get(id);
        if (!productBatch) throw new Error('product batch was not found');
        productBatch.move({ order });
      });

      aggregates.push(...productBatchMap.values(), productBatch);

      await this.productBatchService.saveAggregates({
        aggregates,
        requestId,
        queryRunner,
      });

      // save groups
      const groupEvents =
        await productBatchGroupEventRepo.findManyByAggregateId(
          otherGroups.map(item => item.id),
        );
      const groupMap = new Map(
        [...groupEvents.entries()].map(([aggregateId, groupEvents]) => [
          aggregateId,
          ProductBatchGroup.buildFromEvents(
            groupEvents as RevisionProductBatchGroupEvent[],
          ),
        ]),
      );
      otherGroups.forEach(({ id, order }) => {
        const group = groupMap.get(id);
        if (!group) throw new Error('group was not found');
        group.move({ order });
      });

      await productBatchGroupEventRepo.saveAggregateEvents({
        aggregates: [...groupMap.values()],
        requestId,
      });

      await productBatchGroupRepo.upsert(
        [...groupMap.values()].map(item => item.toObject()),
        ['id'],
      );
      // await this.productBatchService.relinkPostings({
      //   queryRunner,
      //   affectedIds: [id, ...affectedIds],
      //   affectedGroupIds,
      // });

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
