import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNil } from '@/common/helpers/utils.js';
import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/move-product-batch/move-product-batch.command.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { RequestRepository } from '@/request/request.repository.js';

@CommandHandler(MoveProductBatchCommand)
export class MoveProductBatchHandler
  implements ICommandHandler<MoveProductBatchCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly requestRepo: RequestRepository,
    private readonly productBatchRepo: ProductBatchReadRepo,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
    private readonly productBatchGroupService: ProductBatchGroupService,
  ) {}

  async execute(command: MoveProductBatchCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const { dto } = command;

      const productBatchRepo = queryRunner.manager.withRepository(
        this.productBatchRepo,
      );

      let productBatch = await this.productBatchService.getReadModel({
        id: dto.id,
        queryRunner,
      });
      const aggregates: ProductBatch[] = [];

      // todo: при возврате в родную колонку и если не было изменений кроме переноса - стоит вернуть родительскую партию

      const newChildBatch =
        await this.productBatchService.shouldSplitAndReturnNewChild({
          productBatch,
          queryRunner,
        });

      if (newChildBatch) {
        aggregates.push(productBatch);
        productBatch = newChildBatch;
      }

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
      const productBatchMap = await this.productBatchService.getReadModelMap({
        queryRunner,
        ids: otherItems.map(item => item.id),
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
      const groupMap = await this.productBatchGroupService.getReadModelMap({
        ids: otherGroups.map(item => item.id),
        queryRunner,
      });

      otherGroups.forEach(({ id, order }) => {
        const group = groupMap.get(id);
        if (!group) throw new Error('group was not found');
        group.move({ order });
      });

      await this.productBatchGroupService.saveAggregates({
        aggregates: [...groupMap.values()],
        requestId,
        queryRunner,
      });

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
