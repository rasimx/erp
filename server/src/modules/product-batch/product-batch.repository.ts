import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type FindOptionsWhere, In, IsNull, Repository } from 'typeorm';

import type { FindLatestRequest } from '@/microservices/proto/erp.pb.js';
import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import type { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchGroupEntity } from '@/product-batch-group/product-batch-group.entity.js';
import { StatusEntity } from '@/status/status.entity.js';

export class ProductBatchRepository extends Repository<ProductBatchEntity> {
  async productBatchList({
    productIds,
    statusIds,
  }: GetProductBatchListDto): Promise<ProductBatchEntity[]> {
    let query = this.createQueryBuilder('pb')
      .leftJoinAndSelect('pb.product', 'product')
      .leftJoinAndSelect('pb.status', 'status')
      .where('pb.deleted_date is null');
    if (productIds.length) {
      query = query.andWhere('pb.productId in (:...productIds)', {
        productIds,
      });
    }
    if (statusIds.length) {
      query = query.andWhere('pb.statusId in (:...statusIds)', {
        statusIds,
      });
    }

    const items = await query.orderBy('pb.order', 'ASC').getMany();
    return items.map(item => ({
      ...item,
      volume: item.volume,
      weight: item.weight,
    }));
  }

  async createFromDto(dto: CreateProductBatchDto) {
    const { statusId, groupId } = dto;
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

    let order = 1;
    if (groupId) {
      const lastBatch = await this.findOne({
        where: { groupId },
        order: { order: 'DESC' },
      });
      if (lastBatch) {
        order = lastBatch.order + 1;
      }
    } else if (statusId) {
      const lastOrderInStatus = await this.getLastOrderInStatus(statusId);
      if (lastOrderInStatus) {
        order = lastOrderInStatus + 1;
      }
    }

    let newEntity = new ProductBatchEntity();
    Object.assign(newEntity, dto, {
      order,
      costPricePerUnit: dto.costPricePerUnit,
      operationsPricePerUnit: parent?.operationsPricePerUnit ?? 0,
      operationsPrice: parent?.operationsPrice ?? 0,
      statusId,
      groupId,
    });
    newEntity = await this.save(newEntity);
    return newEntity;
  }

  async getLastOrderInStatus(statusId: number): Promise<number | null> {
    const lastItems: (ProductBatchEntity | ProductBatchGroupEntity)[] = [];
    const lastUngroupedBatch = await this.findOne({
      where: { statusId: statusId, groupId: IsNull() },
      order: { order: 'DESC' },
    });
    if (lastUngroupedBatch) lastItems.push(lastUngroupedBatch);

    const lastGroup = await this.manager.findOne(ProductBatchGroupEntity, {
      where: { statusId: statusId },
      order: { order: 'DESC' },
    });
    if (lastGroup) lastItems.push(lastGroup);

    return lastItems.length
      ? Math.max(...lastItems.map(({ order }) => order))
      : null;
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
    if (!(oldGroupId ?? oldStatusId))
      throw new Error('oldGroupId or oldStatusId');
    let query = this.createQueryBuilder()
      .update()
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
    if (!(groupId ?? statusId)) throw new Error('groupId or statusId');

    let query = this.createQueryBuilder()
      .update()
      .set({ order: () => '"order" + 1' })
      .where('"order" >= :newOrder', {
        newOrder,
      });

    if (groupId) {
      query = query.andWhere('groupId = :groupId', {
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
    if (!(groupId ?? statusId)) throw new Error('groupId or statusId');

    let query = this.createQueryBuilder().update();
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
    statusId: number | null;
    oldStatusId: number | null;
    groupId: number | null;
    oldGroupId: number | null;
  }> {
    const { id, statusId, groupId } = dto;
    if (!(statusId || groupId))
      throw new BadRequestException('statusId or groupId');

    let order = dto.order;
    let batch = await this.findOneOrFail({
      where: { id },
      relations: ['status'],
    });

    let lastOrder = 1;
    if (groupId) {
      const lastBatch = await this.findOne({
        where: { groupId },
        order: { order: 'DESC' },
      });
      if (lastBatch) {
        lastOrder =
          groupId == batch.groupId ? lastBatch.order : lastBatch.order + 1;
      }
    } else if (statusId) {
      const lastOrderInStatus = await this.getLastOrderInStatus(statusId);
      if (lastOrderInStatus) {
        lastOrder =
          statusId == batch.statusId
            ? lastOrderInStatus
            : lastOrderInStatus + 1;
      }
    }

    order = order ? Math.min(order, lastOrder) : lastOrder;

    const oldOrder = batch.order;
    const oldStatusId = batch.statusId;
    const oldGroupId = batch.groupId;
    batch.order = order;
    if (groupId) {
      const group = await this.manager.findOneOrFail(ProductBatchGroupEntity, {
        where: { id: groupId },
      });
      batch.group = group;
      batch.status = null;
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
    } else {
      if (!statusId) throw new Error('statusId was not defined');
      const status = await this.manager.findOneOrFail(StatusEntity, {
        where: { id: statusId },
      });

      batch.status = status;
      batch.group = null;
      batch = await this.save(batch);
      await this.moveOthersByStatus({
        id: batch.id,
        statusId,
        oldStatusId,
        order,
        oldOrder,
      });
    }
    return {
      id,
      order,
      oldOrder,
      oldGroupId,
      groupId,
      statusId,
      oldStatusId,
    };
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

  async findByCondition({
    productId,
    statusId,
    storeId,
  }: {
    productId?: number[] | number;
    statusId?: number[] | number;
    storeId?: number[] | number;
  }): Promise<ProductBatchEntity[]> {
    const where: FindOptionsWhere<ProductBatchEntity> = {};
    if (productId)
      where.productId = Array.isArray(productId) ? In(productId) : productId;
    if (statusId)
      where.statusId = Array.isArray(statusId) ? In(statusId) : statusId;
    if (storeId)
      where.status = {
        storeId: Array.isArray(storeId) ? In(storeId) : storeId,
      };

    return this.find({ where });
  }

  // async getProductBatchesMapByStatusId(
  //   productBatches: {
  //     productId: number;
  //     statusId: number;
  //     productBatchId?: number;
  //   }[],
  // ): Promise<Map<number, Map<number, ProductBatchEntity[]>>> {
  //   const entityManager = this.repository;
  //
  //   // Преобразуем массив объектов в массив строк для SQL-запроса
  //   const productBatchConditions = productBatches
  //     .map(pb => {
  //       const common = `
  //       pb.product_id = ${pb.productId.toString()}
  //       AND pb.status_id = ${pb.statusId.toString()}
  //       `;
  //       if (pb.productBatchId) {
  //         return `(
  //           ${common}
  //           AND pb.date >= (SELECT date FROM product_batch WHERE id = ${pb.productBatchId.toString()})
  //           )`;
  //       } else {
  //         return `(${common})`;
  //       }
  //     })
  //     .join(' OR ');
  //
  //   const query = `
  //   SELECT pb.id
  //   FROM product_batch pb
  //   WHERE (${productBatchConditions})
  //   ORDER BY pb.product_id, pb.date;
  // `;
  //
  //   const rows: { id: number }[] = await entityManager.query(query);
  //
  //   const pbMapByProductId = new Map<number, Map<number, ProductBatch[]>>();
  //
  //   const items = await this.findProductBatchByIds(rows.map(row => row.id));
  //
  //   items.forEach(row => {
  //     let mapItem = pbMapByProductId.get(row.statusId);
  //     if (!mapItem) mapItem = new Map<number, ProductBatch[]>();
  //     let subMapItem = mapItem.get(row.productId);
  //     if (!subMapItem) subMapItem = [];
  //     subMapItem.push(row);
  //     mapItem.set(row.productId, subMapItem);
  //     pbMapByProductId.set(row.statusId, mapItem);
  //   });
  //
  //   return pbMapByProductId;
  // }
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
