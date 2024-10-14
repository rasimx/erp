import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNil } from '@/common/helpers/utils.js';
import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { MoveProductBatchGroupCommand } from '@/product-batch-group/commands/move-product-batch-group/move-product-batch-group.command.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { RequestRepository } from '@/request/request.repository.js';

@CommandHandler(MoveProductBatchGroupCommand)
export class MoveProductBatchGroupHandler
  implements ICommandHandler<MoveProductBatchGroupCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly requestRepo: RequestRepository,
    private readonly contextService: ContextService,
    private readonly productBatchReadRepo: ProductBatchReadRepo,
    private readonly productBatchGroupService: ProductBatchGroupService,
    private readonly productBatchService: ProductBatchService,
  ) {}

  async execute(command: MoveProductBatchGroupCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchReadRepo,
    );

    try {
      const { dto } = command;

      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const group = await this.productBatchGroupService.getReadModel({
        id: dto.id,
        queryRunner,
      });

      const otherItems: { id: number; order: number }[] = [];
      const otherGroups: { id: number; order: number }[] = [];

      const { order: oldOrder, statusId: oldStatusId } = group.toObject();

      const lastOrderInStatus = await productBatchRepo.getLastOrderInStatus(
        dto.statusId,
      );

      const maxOrder =
        oldStatusId === dto.statusId
          ? lastOrderInStatus || 1
          : lastOrderInStatus
            ? lastOrderInStatus + 1
            : 1;
      const order = dto.order ? Math.min(dto.order, maxOrder) : maxOrder;

      if (dto.statusId === oldStatusId) {
        const minOrder = Math.min(order, oldOrder);

        const entitiesInStatus = (
          await productBatchRepo.getEntitiesInStatusMoreThanOrEqualOrder({
            statusId: oldStatusId,
            order: minOrder,
          })
        ).filter(
          item => !(item.entity == 'product_batch_group' && item.id == dto.id),
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
        // обновить порядок в старой колонке
        if (!isNil(oldStatusId)) {
          const entitiesInOldStatus = (
            await productBatchRepo.getEntitiesInStatusMoreThanOrEqualOrder({
              statusId: oldStatusId,
              order: oldOrder,
            })
          ).filter(
            item =>
              !(item.entity == 'product_batch_group' && item.id == dto.id),
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

      group.move({
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

      await this.productBatchService.saveAggregates({
        aggregates: [...productBatchMap.values()],
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
        aggregates: [...groupMap.values(), group],
        requestId,
        queryRunner,
      });

      // const { id, statusId, oldStatusId, order, oldOrder, affectedGroupIds } =
      //   await productBatchGroupRepository.moveProductBatchGroup(dto);
      // const affectedIds = await productBatchRepository.moveOthersByStatus({
      //   statusId,
      //   oldStatusId,
      //   order,
      //   oldOrder,
      // });

      // await this.productBatchService.relinkPostings({
      //   queryRunner,
      //   affectedIds,
      //   affectedGroupIds: [id, ...affectedGroupIds],
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
