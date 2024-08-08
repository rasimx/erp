import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { objectToCamel } from 'ts-case-convert';
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

  async moveOthersInOldGroup({
    id,
    oldOrder,
    oldGroupId,
  }: {
    id?: number;
    oldOrder: number;
    oldGroupId: number;
  }) {
    let query = this.createQueryBuilder('pb').where(
      '"order" >= :oldOrder and group_id = :oldGroupId and id != :id',
      {
        oldOrder,
        oldGroupId,
        id,
      },
    );
    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }

    const affectedIds = await query
      .select('pb.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    await query
      .update()
      .set({ order: () => '"order" - 1' })
      .execute();

    return affectedIds;
  }
  async moveOthersInOldStatus({
    id,
    oldOrder,
    oldStatusId,
  }: {
    id?: number;
    oldOrder: number;
    oldStatusId: number;
  }) {
    let query = this.createQueryBuilder('pb').where(
      '"order" >= :oldOrder and status_id = :oldStatusId',
      {
        oldOrder,
        oldStatusId,
      },
    );
    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }

    const affectedIds = await query
      .select('pb.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    await query
      .update()
      .set({ order: () => '"order" - 1' })
      .execute();

    return affectedIds;
  }

  async moveOthersInNewGroup({
    id,
    newOrder,
    groupId,
  }: {
    id: number;
    newOrder: number;
    groupId: number;
  }) {
    const query = this.createQueryBuilder('pb').where(
      '"order" >= :newOrder and group_id = :groupId and id != :id',
      {
        newOrder,
        groupId,
        id,
      },
    );

    const affectedIds = await query
      .select('pb.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    await query
      .update()
      .set({ order: () => '"order" + 1' })
      .execute();

    return affectedIds;
  }
  async moveOthersInNewStatus({
    id,
    newOrder,
    statusId,
  }: {
    id?: number;
    newOrder: number;
    statusId: number;
  }) {
    let query = this.createQueryBuilder('pb').where(
      '"order" >= :newOrder and status_id = :statusId',
      {
        newOrder,
        statusId,
      },
    );

    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }

    const affectedIds = await query
      .select('pb.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    await query
      .update()
      .set({ order: () => '"order" + 1' })
      .execute();

    return affectedIds;
  }

  async moveOthersInsideGroup({
    newOrder,
    oldOrder,
    groupId,
    id,
  }: {
    newOrder: number;
    oldOrder: number;
    groupId: number;
    id: number;
  }) {
    let query = this.createQueryBuilder('pb').where(
      'group_id = :groupId and id != :id',
      {
        groupId,
        id,
      },
    );

    if (newOrder < oldOrder) {
      query = query.andWhere('"order" >= :newOrder AND "order" <= :oldOrder', {
        newOrder,
        oldOrder,
      });
    } else {
      query = query.andWhere('"order" >= :oldOrder AND "order" <= :newOrder', {
        oldOrder,
        newOrder,
      });
    }

    const affectedIds = await query
      .select('pb.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    if (newOrder < oldOrder) {
      await query
        .update()
        .set({ order: () => '"order" + 1' })
        .execute();
    } else {
      await query
        .update()
        .set({ order: () => '"order" - 1' })
        .execute();
    }

    return affectedIds;
  }

  async moveOthersInsideStatus({
    id,
    newOrder,
    oldOrder,
    statusId,
  }: {
    newOrder: number;
    oldOrder: number;
    statusId: number;
    id?: number;
  }) {
    let query = this.createQueryBuilder('pb').where('status_id = :statusId', {
      statusId,
    });
    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }
    if (newOrder < oldOrder) {
      query = query.andWhere('"order" >= :newOrder AND "order" <= :oldOrder', {
        newOrder,
        oldOrder,
      });
    } else {
      query = query.andWhere('"order" >= :oldOrder AND "order" <= :newOrder', {
        oldOrder,
        newOrder,
      });
    }

    const affectedIds = await query
      .select('pb.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    if (newOrder < oldOrder) {
      await query
        .update()
        .set({ order: () => '"order" + 1' })
        .execute();
    } else {
      await query
        .update()
        .set({ order: () => '"order" - 1' })
        .execute();
    }

    return affectedIds;
  }

  async moveOthersByStatus({
    id,
    statusId,
    oldStatusId,
    oldGroupId,
    order,
    oldOrder,
  }: {
    id?: number;
    statusId: number;
    oldStatusId: number | null;
    oldGroupId?: number | null;
    order: number;
    oldOrder: number;
  }) {
    const affectedIds: number[] = [];

    if (oldStatusId === statusId) {
      // Перемещение внутри одного столбца
      affectedIds.push(
        ...(await this.moveOthersInsideStatus({
          statusId,
          id,
          newOrder: order,
          oldOrder,
        })),
      );
    } else {
      // Перемещение в другой столбец
      affectedIds.push(
        ...(await this.moveOthersInNewStatus({
          id,
          newOrder: order,
          statusId,
        })),
      );
      if (oldStatusId)
        affectedIds.push(
          ...(await this.moveOthersInOldStatus({ id, oldOrder, oldStatusId })),
        );

      if (oldGroupId)
        affectedIds.push(
          ...(await this.moveOthersInOldGroup({ oldOrder, oldGroupId })),
        );
    }
    return affectedIds;
  }

  async moveOthersByGroup({
    id,
    groupId,
    oldGroupId,
    oldStatusId,
    order,
    oldOrder,
  }: {
    id: number;
    groupId: number;
    oldGroupId: number | null;
    oldStatusId?: number | null;
    order: number;
    oldOrder: number;
  }) {
    const affectedIds: number[] = [];
    if (oldGroupId === groupId) {
      // Перемещение внутри одной группы
      affectedIds.push(
        ...(await this.moveOthersInsideGroup({
          id,
          groupId,
          newOrder: order,
          oldOrder,
        })),
      );
    } else {
      // Перемещение в другой столбец
      affectedIds.push(
        ...(await this.moveOthersInNewGroup({
          id,
          newOrder: order,
          groupId,
        })),
      );
      if (oldGroupId)
        affectedIds.push(
          ...(await this.moveOthersInOldGroup({ oldOrder, oldGroupId })),
        );
      if (oldStatusId)
        affectedIds.push(
          ...(await this.moveOthersInOldStatus({ id, oldOrder, oldStatusId })),
        );
    }
    return affectedIds;
  }

  async moveProductBatch(dto: MoveProductBatchDto): Promise<{
    id: number;
    order: number;
    oldOrder: number;
    statusId: number | null;
    oldStatusId: number | null;
    groupId: number | null;
    oldGroupId: number | null;
    affectedIds: number[];
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

    const affectedIds: number[] = [];

    if (groupId) {
      const group = await this.manager.findOneOrFail(ProductBatchGroupEntity, {
        where: { id: groupId },
      });
      batch.group = group;
      batch.status = null;
      batch = await this.save(batch);
      // Обновите порядок карточек в группах
      affectedIds.push(
        ...(await this.moveOthersByGroup({
          id: batch.id,
          groupId,
          oldGroupId,
          oldStatusId,
          order,
          oldOrder,
        })),
      );
    } else {
      if (!statusId) throw new Error('statusId was not defined');
      const status = await this.manager.findOneOrFail(StatusEntity, {
        where: { id: statusId },
      });

      batch.status = status;
      batch.group = null;
      batch = await this.save(batch);
      affectedIds.push(
        ...(await this.moveOthersByStatus({
          id: batch.id,
          statusId,
          oldStatusId,
          oldGroupId,
          order,
          oldOrder,
        })),
      );
    }
    return {
      id,
      order,
      oldOrder,
      oldGroupId,
      groupId,
      statusId,
      oldStatusId,
      affectedIds,
    };
  }

  /**
   * Осуществляет вычисление суммы двух чисел.
   *
   * @param {Object} arg - принимает один аргумент в виде объекта
   * @param {Object} arg.items - Все важное здесь
   * @param {number} arg.items.productId - id продукта
   * @param {number[]} arg.items.productBatchIds - // id партий, если указать, вернет все, начиная с самого первого из
   * указаных в порядке order и все последующие в порядке order, даже те что не указаны
   * @param {number} storeId - id магазина
   * @param {number} withDeleted - учитывать удаленные?
   *
   * @returns {Map<number, ProductBatchEntity[]>} Сумма двух чисел.
   */
  async findLatest({
    items,
    storeId,
    withDeleted = false,
  }: {
    items: {
      productId: number;
      productBatchIds: number[];
    }[];
    storeId: number;
    withDeleted?: boolean;
  }): Promise<Map<number, ProductBatchEntity[]>> {
    const productIds = items.map(({ productId }) => productId);
    const productBatchIds = items.flatMap(
      ({ productBatchIds }) => productBatchIds,
    );
    const query = `
WITH all_batches AS (SELECT pb.id,
                            pb.count,
                            pb.product_id,
                            pb.order                              AS batch_order,
                            pbg.order                             AS group_order,
                            COALESCE(pbg.order, pb.order)         AS global_order,
                            s.store_id
                     FROM product_batch pb
                              LEFT JOIN product_batch_group pbg ON pb.group_id = pbg.id
                              LEFT JOIN status s ON pb.status_id = s.id or pbg.status_id = s.id
                     ${withDeleted ? '' : 'WHERE pb.deleted_date is null'}),
     batches_in_target_status AS (select *
                                  from all_batches
                                  where store_id = ${storeId.toString()}
                                    and product_id in (${productIds.join(',')})),

     last_batches AS (SELECT distinct on (product_id) product_id, global_order, batch_order
                      FROM batches_in_target_status
                      ORDER BY product_id, global_order DESC,
                               batch_order DESC),

     target_batch AS (SELECT distinct on (product_id) product_id, global_order, batch_order
                      FROM batches_in_target_status
                      WHERE id in (${productBatchIds.length ? productBatchIds.join(',') : 'null'})
                      ORDER BY product_id, global_order,
                          batch_order),
     result as (SELECT b.id, b.product_id, b.count
                FROM batches_in_target_status b
                         left join last_batches lb on b.product_id = lb.product_id
                         left join target_batch tb on b.product_id = tb.product_id
                WHERE ((b.global_order > tb.global_order)
                    OR (b.global_order = tb.global_order AND b.batch_order >= tb.batch_order))
                   OR ((b.global_order > lb.global_order)
                    OR (b.global_order = lb.global_order AND b.batch_order >= lb.batch_order))
                ORDER BY b.global_order,
                         b.batch_order)
select *, row_number() over () as order
from result;
    `;

    const rows = objectToCamel(await this.query(query)) as ProductBatchEntity[];
    const map = new Map<number, ProductBatchEntity[]>();
    rows.forEach(row => {
      const mapItem = map.get(row.productId) ?? [];
      mapItem.push(row);
      map.set(row.productId, mapItem);
    });
    return map;
  }

  // async findFromOrder({
  //   productId,
  //   starterOrder,
  //   statusId,
  // }: {
  //   productId: number;
  //   starterOrder: number;
  //   statusId: number;
  // }) {
  //   const query = `
  //       WITH all_batches AS (SELECT pb.id,
  //                                   pb.count,
  //                                   pb.product_id,
  //                                   pb.order                              AS batch_order,
  //                                   pbg.order                             AS group_order,
  //                                   COALESCE(pbg.order, pb.order)         AS global_order,
  //                                   COALESCE(pbs.store_id, pbgs.store_id) AS global_store_id
  //                            FROM product_batch pb
  //                                     LEFT JOIN
  //                                 product_batch_group pbg ON pb.group_id = pbg.id
  //                                     left join status pbs on pb.status_id = pbs.id
  //                                     left join status pbgs on pbg.status_id = pbgs.id)
  //                            WHERE deleted_date is null,
  //            store_batches AS (select * from all_batches where global_store_id = ${storeId.toString()} and product_id = ${productId.toString()}),
  //            target_batch AS (SELECT *
  //                             FROM store_batches
  //                             WHERE id = COALESCE(${starterId?.toString() ?? 'null'}, (SELECT id
  //                                                                                  FROM store_batches
  //                                                                                  ORDER BY global_order DESC,
  //                                                                      batch_order DESC
  //
  //                                                 LIMIT 1))),
  //            result as (SELECT sb.id, sb.product_id, sb.count
  //                       FROM store_batches sb,
  //                            target_batch tb
  //                       WHERE (sb.global_order > tb.global_order)
  //                          OR (sb.global_order = tb.global_order AND sb.batch_order >= tb.batch_order)
  //                       ORDER BY sb.global_order,
  //                                sb.batch_order)
  //       select *, row_number() over () as order
  //       from result;
  //   `;
  //   return objectToCamel(await this.query(query)) as {
  //     id: number;
  //     productId: number;
  //     count: number;
  //     order: string;
  //   }[];
  // }

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
