import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from '@/product-batch-group/dtos/move-product-batch-group.dto.js';
import { ProductBatchGroupEntity } from '@/product-batch-group/product-batch-group.entity.js';
import { StatusEntity } from '@/status/status.entity.js';

export class ProductBatchGroupRepository extends Repository<ProductBatchGroupEntity> {
  async getLastOrder(statusId: number): Promise<number | null> {
    const lastItems: (ProductBatchEntity | ProductBatchGroupEntity)[] = [];
    const lastUngroupedBatch = await this.manager.findOne(ProductBatchEntity, {
      where: { statusId: statusId, groupId: IsNull() },
      order: { order: 'DESC' },
    });
    if (lastUngroupedBatch) lastItems.push(lastUngroupedBatch);

    const lastGroup = await this.findOne({
      where: { statusId: statusId },
      order: { order: 'DESC' },
    });
    if (lastGroup) lastItems.push(lastGroup);

    return lastItems.length
      ? Math.max(...lastItems.map(({ order }) => order))
      : null;
  }

  async createFromDto(dto: CreateProductBatchGroupDto) {
    const lastOrder = await this.getLastOrder(dto.statusId);
    const order = lastOrder ? lastOrder + 1 : 1;

    let newEntity = new ProductBatchGroupEntity();
    Object.assign(newEntity, dto, { order });
    newEntity = await this.save(newEntity);

    if (dto.existProductBatchIds.length) {
      const existProductBatches = await this.manager.find(ProductBatchEntity, {
        where: { id: In(dto.existProductBatchIds) },
      });
      const existIds = existProductBatches.map(({ id }) => id);
      const notFoundIds = dto.existProductBatchIds.filter(
        id => !existIds.includes(id),
      );
      if (notFoundIds.length) {
        throw new BadRequestException(
          `not found batches: ${notFoundIds.join(',')}`,
        );
      }
      newEntity.productBatchList = existProductBatches;
    }
    if (dto.newProductBatches.length) {
      const productBatchRepository = new ProductBatchRepository(
        ProductBatchEntity,
        this.manager,
        this.queryRunner,
      );
      const items: ProductBatchEntity[] = [];
      for (const item of dto.newProductBatches) {
        items.push(
          await productBatchRepository.createFromDto({
            dto: item,
            groupId: newEntity.id,
            statusId: null,
          }),
        );
      }

      newEntity.productBatchList = [
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ...(newEntity.productBatchList || []),
        ...items,
      ];
    }

    newEntity = await this.save(newEntity);

    return newEntity;
  }

  async moveOthersInOld({
    oldOrder,
    oldStatusId,
  }: {
    oldOrder: number;
    oldStatusId: number;
  }) {
    return this.createQueryBuilder()
      .update()
      .set({ order: () => '"order" - 1' })
      .where('"order" > :oldOrder AND statusId = :oldStatusId', {
        oldOrder,
        oldStatusId,
      })
      .execute();
  }

  async moveOthersInNew({
    id,
    newOrder,
    statusId,
  }: {
    id?: number;
    newOrder: number;
    statusId: number;
  }) {
    let query = this.createQueryBuilder()
      .update()
      .set({ order: () => '"order" + 1' })
      .where('"order" >= :newOrder AND statusId = :statusId', {
        newOrder,
        id,
        statusId,
      });
    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }
    return query.execute();
  }

  async moveOthersByMovingInside({
    id,
    newOrder,
    oldOrder,
    statusId,
  }: {
    id?: number;
    newOrder: number;
    oldOrder: number;
    statusId: number;
  }) {
    let query = this.createQueryBuilder().update();
    if (newOrder < oldOrder) {
      query = query
        .set({ order: () => '"order" + 1' })
        .where(
          '"order" >= :newOrder AND "order" <= :oldOrder AND statusId = :statusId',
          {
            newOrder,
            oldOrder,
            statusId,
          },
        );
    } else {
      query = query
        .set({ order: () => '"order" - 1' })
        .where(
          '"order" >= :oldOrder AND "order" <= :newOrder AND statusId = :statusId',
          {
            oldOrder,
            newOrder,
            statusId,
          },
        );
    }

    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }

    return query.execute();
  }

  async moveOthers({
    id,
    statusId,
    oldStatusId,
    order,
    oldOrder,
  }: {
    id?: number;
    statusId: number | null;
    oldStatusId: number | null;
    order: number;
    oldOrder: number;
  }) {
    if (statusId && oldStatusId === statusId) {
      // Перемещение внутри одного столбца
      await this.moveOthersByMovingInside({
        statusId,
        id,
        newOrder: order,
        oldOrder,
      });
    } else {
      // Перемещение в другой столбец
      if (statusId) {
        await this.moveOthersInNew({
          id,
          newOrder: order,
          statusId,
        });
      }

      if (oldStatusId) await this.moveOthersInOld({ oldOrder, oldStatusId });
    }
  }

  async moveProductBatchGroup(dto: MoveProductBatchGroupDto): Promise<{
    id: number;
    order: number;
    oldOrder: number;
    statusId: number;
    oldStatusId: number;
  }> {
    const { id, statusId } = dto;

    let order = dto.order;
    let group = await this.findOneOrFail({
      where: { id },
      relations: ['status'],
    });

    let lastOrder = 1;

    const lastOrderInStatus = await this.getLastOrder(statusId);
    if (lastOrderInStatus) {
      lastOrder =
        statusId == group.statusId ? lastOrderInStatus : lastOrderInStatus + 1;
    }

    order = order ? Math.min(order, lastOrder) : lastOrder;

    if (!order) {
      const lastOrder = await this.getLastOrder(dto.statusId);

      order = !lastOrder
        ? 1
        : statusId == group.statusId
          ? lastOrder
          : lastOrder + 1;
    }
    const status = await this.manager.findOneOrFail(StatusEntity, {
      where: { id: statusId },
    });

    const oldOrder = group.order;
    group.order = order;
    const oldStatusId = group.statusId;
    group.status = status;
    group = await this.save(group);
    await this.moveOthers({
      id: group.id,
      statusId,
      oldStatusId,
      order,
      oldOrder,
    });
    return {
      id,
      order,
      oldOrder,
      statusId,
      oldStatusId,
    };
  }

  // todo: productId
  async findItems(productId?: number) {
    return this.createQueryBuilder('pbg')
      .leftJoinAndSelect('pbg.productBatchList', 'productBatchList')
      .leftJoinAndSelect('productBatchList.product', 'product')
      .leftJoinAndSelect('pbg.status', 'status')
      .orderBy('pbg.order', 'ASC')
      .orderBy('productBatchList.order', 'ASC')
      .where('pbg.deleted_date is null')
      .getMany();
  }
}

export const ProductBatchGroupRepositoryProvider = {
  provide: ProductBatchGroupRepository,
  inject: [getRepositoryToken(ProductBatchGroupEntity)],
  useFactory: (repository: Repository<ProductBatchGroupEntity>) => {
    return new ProductBatchGroupRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
