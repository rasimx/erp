import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from '@/product-batch-group/dtos/move-product-batch-group.dto.js';
import { ProductBatchGroupEntity } from '@/product-batch-group/product-batch-group.entity.js';

export class ProductBatchGroupRepository extends Repository<ProductBatchGroupEntity> {
  async createFromDto(dto: CreateProductBatchGroupDto) {
    /*
     * если создается в новой колонке то order - последний
     * если создается в той же партии
     * */

    const lastItems: (ProductBatchEntity | ProductBatchGroupEntity)[] = [];
    const lastUngroupedBatch = await this.manager.findOne(ProductBatchEntity, {
      where: { statusId: dto.statusId, groupId: IsNull() },
      order: { order: 'DESC' },
    });
    if (lastUngroupedBatch) lastItems.push(lastUngroupedBatch);

    const lastGroup = await this.findOne({
      where: { statusId: dto.statusId },
      order: { order: 'DESC' },
    });
    if (lastGroup) lastItems.push(lastGroup);

    const order = lastItems.length
      ? Math.max(...lastItems.map(({ order }) => order)) + 1
      : 1;

    let newEntity = new ProductBatchGroupEntity();
    Object.assign(newEntity, dto, { order });
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
      .update(ProductBatchEntity)
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
      .update(ProductBatchEntity)
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
    let query = this.createQueryBuilder().update(ProductBatchEntity);
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
          '"order" >= :oldOrder AND "order" <= :newOrder AND statusId = :statusIdr',
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
    statusId: number;
    oldStatusId: number | null;
    order: number;
    oldOrder: number;
  }) {
    if (oldStatusId === statusId) {
      // Перемещение внутри одного столбца
      await this.moveOthersByMovingInside({
        statusId,
        id,
        newOrder: order,
        oldOrder,
      });
    } else {
      // Перемещение в другой столбец
      await this.moveOthersInNew({
        id,
        newOrder: order,
        statusId,
      });
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

    if (!order) {
      const lastGroup = await this.findOne({
        where: { statusId },
        order: { order: 'DESC' },
      });

      order = !lastGroup
        ? 1
        : lastGroup.statusId == group.statusId
          ? lastGroup.order
          : lastGroup.order + 1;
    }

    const oldOrder = group.order;
    group.order = order;
    const oldStatusId = group.statusId;
    group.statusId = statusId;
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
