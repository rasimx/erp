import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import omit from 'lodash/omit.js';
import { Repository } from 'typeorm';

import type { FindLatestRequest } from '@/microservices/proto/erp.pb.js';
import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';

export class ProductBatchRepository extends Repository<ProductBatchEntity> {
  async createFromDto(dto: CreateProductBatchDto) {
    /*
     * если создается в новой колонке то order - последний
     * если создается в той же партии
     * */

    let parent: ProductBatchEntity | null = null;
    if (dto.parentId) {
      parent = await this.findOneOrFail({
        where: { id: dto.parentId },
      });
      if (dto.count >= parent.count) {
        throw new BadRequestException(
          `количество не может быть больше или равно чем у предка`,
        );
      }
      if (dto.productId && parent.productId != dto.productId) {
        throw new BadRequestException(`разные товары`);
      }
      parent.count = parent.count - dto.count;
      await this.save(parent);
    }

    let lastBatch: ProductBatchEntity | null = null;
    lastBatch = await this.findOne({
      where: { statusId: dto.statusId },
      order: { order: 'DESC' },
    });

    const order = lastBatch ? lastBatch.order + 1 : 1;

    let newEntity = new ProductBatchEntity();
    Object.assign(newEntity, dto, { order, operationsPricePerUnit: 0 });
    if (parent) {
      Object.assign(newEntity, omit(parent, ['id', 'order', 'count']), {
        parent: parent,
        count: dto.count,
        order,
      });
    }
    newEntity = await this.save(newEntity);
    return newEntity;
  }

  async moveOthersInOld({
    oldOrder,
    oldGroupId,
    oldStatusId,
  }: {
    oldOrder: number;
    oldGroupId?: number;
    oldStatusId?: number;
  }) {
    if (!oldGroupId || !oldStatusId)
      throw new Error('oldGroupId or oldStatusId');
    let query = this.createQueryBuilder()
      .update(ProductBatchEntity)
      .set({ order: () => '"order" - 1' })
      .where('"order" > :oldOrder', {
        oldOrder,
      });

    if (oldGroupId) {
      query = query.andWhere('groupId = :oldGroupId ', {
        oldGroupId,
      });
    } else {
      query = query.andWhere('statusId = :oldStatusId', {
        oldStatusId,
      });
    }

    return query.execute();
  }

  async moveOthersInNew({
    id,
    newOrder,
    statusId,
    groupId,
  }: {
    id?: number;
    newOrder: number;
    statusId?: number;
    groupId?: number;
  }) {
    if (!groupId || !statusId) throw new Error('groupId or statusId');

    let query = this.createQueryBuilder()
      .update(ProductBatchEntity)
      .set({ order: () => '"order" + 1' })
      .where('"order" >= :newOrder', {
        newOrder,
      });

    if (groupId) {
      query = query.andWhere('groupId = :groupId ', {
        groupId,
      });
    } else {
      query = query.andWhere('statusId = :statusId', {
        statusId,
      });
    }

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
    groupId,
    statusId,
  }: {
    newOrder: number;
    oldOrder: number;
    id?: number;
    groupId?: number;
    statusId?: number;
  }) {
    if (!groupId || !statusId) throw new Error('groupId or statusId');

    let query = this.createQueryBuilder().update(ProductBatchEntity);
    if (newOrder < oldOrder) {
      query = query
        .set({ order: () => '"order" + 1' })
        .where('"order" >= :newOrder AND "order" <= :oldOrder', {
          newOrder,
          oldOrder,
        });
    } else {
      query = query
        .set({ order: () => '"order" - 1' })
        .where('"order" >= :oldOrder AND "order" <= :newOrder', {
          oldOrder,
          newOrder,
        });
    }

    if (groupId) {
      query = query.andWhere('groupId = :groupId ', {
        groupId,
      });
    } else {
      query = query.andWhere('statusId = :statusId', {
        statusId,
      });
    }
    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }

    return query.execute();
  }

  async moveOthersByStatus({
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

  async moveProductBatch(dto: MoveProductBatchDto): Promise<{
    id: number;
    order: number;
    oldOrder: number;
    statusId?: number;
    oldStatusId?: number | null;
    groupId?: number;
    oldGroupId?: number | null;
  }> {
    const { id, statusId, groupId } = dto;
    if (!statusId || !groupId)
      throw new BadRequestException('statusId or groupId');

    let order = dto.order;
    let batch = await this.findOneOrFail({
      where: { id },
      relations: ['status'],
    });

    if (!order) {
      const where = groupId ? { groupId } : { statusId };
      const lastBatch = await this.findOne({
        where,
        order: { order: 'DESC' },
      });

      order = !lastBatch
        ? 1
        : groupId
          ? lastBatch.groupId == batch.groupId
            ? lastBatch.order
            : lastBatch.order + 1
          : lastBatch.statusId == batch.statusId
            ? lastBatch.order
            : lastBatch.order + 1;
    }

    const oldOrder = batch.order;
    batch.order = order;
    if (groupId) {
      const oldGroupId = batch.groupId;
      batch.groupId = groupId;
      batch = await this.save(batch);
      // Обновите порядок карточек в старом столбце

      if (oldGroupId === groupId) {
        // Перемещение внутри одного столбца
        await this.moveOthersByMovingInside({
          groupId,
          id: batch.id,
          newOrder: order,
          oldOrder,
        });
      } else {
        // Перемещение в другой столбец
        await this.moveOthersInNew({
          id: batch.id,
          newOrder: order,
          groupId,
        });
        if (oldGroupId) await this.moveOthersInOld({ oldOrder, oldGroupId });
      }
      return {
        id,
        order,
        oldOrder,
        groupId,
        oldGroupId,
      };
    } else {
      const oldStatusId = batch.statusId;
      batch.statusId = statusId;
      batch = await this.save(batch);
      await this.moveOthersByStatus({
        id: batch.id,
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

  async findFromId({ storeId, id }: { storeId: number; id: number }) {
    return this.createQueryBuilder('pb')
      .leftJoinAndSelect('pb.product', 'product')
      .leftJoinAndSelect('pb.status', 'status')
      .leftJoinAndSelect(
        ProductBatchEntity,
        'pb2',
        'pb.product_id = pb2.product_id',
      )
      .where('pb2.id = :id', { id })
      .andWhere('pb.date::date >= pb2.date::date')
      .andWhere('status.store_id = :storeId', { storeId })
      .orderBy('pb.order', 'DESC')
      .getMany();
  }

  async findLatest({
    productId,
    starterId,
    storeId,
  }: FindLatestRequest): Promise<ProductBatchEntity[]> {
    if (starterId !== undefined)
      return this.findFromId({ storeId, id: starterId });
    const last = await this.findOne({
      where: { productId, status: { storeId } },
      relations: ['product', 'status'],
      order: { date: 'desc' },
    });
    return last ? [last] : [];
  }
}

export const ProductBatchRepositoryProvider = {
  provide: ProductBatchRepository,
  inject: [getRepositoryToken(ProductBatchEntity)],
  useFactory: (repository: Repository<ProductBatchEntity>) => {
    return new ProductBatchRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
