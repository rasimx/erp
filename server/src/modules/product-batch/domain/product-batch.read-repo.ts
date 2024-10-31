import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { objectToCamel } from 'ts-case-convert';
import {
  Between,
  type FindOptionsWhere,
  In,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { ProductBatchReadEntity } from '@/product-batch/domain/product-batch.read-entity.js';
import type { CreateProductBatchItemDto } from '@/product-batch/dtos/create-product-batch-list.dto.js';
import type { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchClosureEntity } from '@/product-batch/product-batch-closure.entity.js';
import { ProductBatchGroupReadEntity } from '@/product-batch-group/domain/product-batch-group.read-entity.js';
import { StatusReadEntity } from '@/status/domain/status.read-entity.js';

export class ProductBatchReadRepo extends Repository<ProductBatchReadEntity> {
  async nextIds(count = 1): Promise<number[]> {
    const rows: { nextval: number }[] = await this.query(
      `SELECT nextval('product_batch_id_seq')::int FROM generate_series(1, ${count.toString()});`,
    );
    return rows.map(item => item.nextval);
  }

  async getLastOrderInGroup(groupId: number): Promise<number | null> {
    return this.findOne({
      select: ['order'],
      where: { groupId },
      order: { order: 'desc' },
    }).then(row => row?.order ?? null);
  }

  async getLastOrderInStatus(statusId: number): Promise<number | null> {
    const rows: { order: number }[] = await this.manager.query(`
          select "order"
          from (select id, "order"
                from product_batch_read
                where status_id = ${statusId}
                  and group_id is null and deleted_date is null
                union
                select id, "order"
                from product_batch_group_read
                where status_id = ${statusId.toString()} and deleted_date is null)
          order by "order" DESC limit 1
      `);

    return rows.length ? rows[0].order : null;
  }

  async productBatchList({
    productIds,
    statusIds,
  }: GetProductBatchListDto): Promise<ProductBatchReadEntity[]> {
    let query = this.createQueryBuilder('pb')
      .leftJoinAndSelect('pb.product', 'product')
      .leftJoinAndSelect('pb.status', 'status')
      .leftJoinAndSelect('product.setItems', 'setItems')
      .leftJoinAndSelect('setItems.product', 'setItemsProduct');
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

    query = query.andWhere('pb.count > 0');

    const items = await query.orderBy('pb.order', 'ASC').getMany();
    // @ts-ignore
    return items.map(item => ({
      ...item,
      volume: item.volume,
      weight: item.weight,
      product: {
        ...item.product,
        setItems: item.product.setItems.map(item => ({
          ...item,
          ...item.product,
        })),
      },
    }));
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

  async getIdsInGroupBetweenOrders({
    groupId,
    startOrder,
    endOrder,
  }: {
    groupId: number;
    startOrder: number;
    endOrder: number;
  }) {
    const rows = await this.find({
      select: ['id'],
      where: {
        order: Between(startOrder, endOrder),
        groupId,
      },
    });
    return rows.map(({ id }) => id);
  }

  async getIdsInGroupMoreThanOrEqualOrder({
    groupId,
    order,
  }: {
    groupId: number;
    order: number;
  }) {
    const rows = await this.find({
      select: ['id'],
      where: {
        order: MoreThanOrEqual(order),
        groupId,
      },
      order: { order: 'ASC' },
    });
    return rows.map(({ id }) => id);
  }

  async getEntitiesInStatusMoreThanOrEqualOrder({
    statusId,
    order,
  }: {
    statusId: number;
    order: number;
  }): Promise<
    {
      id: number;
      order: number;
      statusId: number;
      entity: 'product_batch' | 'product_batch_group';
    }[]
  > {
    const rows: {
      id: number;
      order: number;
      status_id: number;
      entity: 'product_batch' | 'product_batch_group';
    }[] = await this.manager.query(`
        select *
        from (select id, "order", status_id, 'product_batch' as entity
              from product_batch_read
              where status_id = ${statusId}
                and deleted_date is null
              union
              select id, "order", status_id, 'product_batch_group' as entity
              from product_batch_group_read
              where status_id = ${statusId}
                and deleted_date is null)
        where "order" >= ${order}
        order by "order"
    `);

    return rows.map(row => ({ ...row, statusId: row.status_id }));
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
   * @returns {Map<number, ProductBatchReadEntity[]>} Сумма двух чисел.
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
  }): Promise<Map<number, ProductBatchReadEntity[]>> {
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
                     FROM product_batch_read pb
                              LEFT JOIN product_batch_group_read pbg ON pb.group_id = pbg.id
                              LEFT JOIN status_read s ON pb.status_id = s.id or pbg.status_id = s.id
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

    const rows = objectToCamel(
      await this.query(query),
    ) as ProductBatchReadEntity[];
    const map = new Map<number, ProductBatchReadEntity[]>();
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
  //                            FROM product_batch_read pb
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
  }): Promise<ProductBatchReadEntity[]> {
    const where: FindOptionsWhere<ProductBatchReadEntity> = {};
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
  //           AND pb.date >= (SELECT date FROM product_batch_read WHERE id = ${pb.productBatchId.toString()})
  //           )`;
  //       } else {
  //         return `(${common})`;
  //       }
  //     })
  //     .join(' OR ');
  //
  //   const query = `
  //   SELECT pb.id
  //   FROM product_batch_read pb
  //   WHERE (${productBatchConditions})
  //   ORDER BY pb.product_id, pb.date;
  // `;
  //
  //   const rows: { id: number }[] = await entityManager.query(query);
  //
  //   const pbMapByProductId = new Map<number, Map<number, ProductBatchAggregate[]>>();
  //
  //   const items = await this.findProductBatchByIds(rows.map(row => row.id));
  //
  //   items.forEach(row => {
  //     let mapItem = pbMapByProductId.get(row.statusId);
  //     if (!mapItem) mapItem = new Map<number, ProductBatchAggregate[]>();
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
  provide: ProductBatchReadRepo,
  inject: [getRepositoryToken(ProductBatchReadEntity)],
  useFactory: (repository: Repository<ProductBatchReadEntity>) => {
    return new ProductBatchReadRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
