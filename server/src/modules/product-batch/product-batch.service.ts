import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import omit from 'lodash/omit.js';
import { Repository } from 'typeorm';

import StrictMap from '@/common/helpers/map.js';
import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import {
  type CreateProductBatchInput,
  type ProductBatch,
  type UpdateProductBatchInput,
} from '@/graphql.schema.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import type { FindLatestRequest } from '@/microservices/proto/erp.pb.js';
import { OperationEntity } from '@/operation/operation.entity.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { StatusService } from '@/status/status.service.js';

function buildAncestorTree(
  ids: number[],
  allBatches: ProductBatchEntity[],
): ProductBatchEntity[] {
  const ancestorTrees: ProductBatchEntity[] = [];
  const batchMap = new Map<number, ProductBatchEntity>();
  allBatches.forEach(batch => batchMap.set(batch.id, batch));

  ids.forEach(id => {
    const batch = batchMap.get(id);
    if (batch) {
      buildTreeWithParent(batch, batchMap);
      ancestorTrees.push(batch);
    }
  });

  return ancestorTrees;
}

function buildTreeWithParent(
  batch: ProductBatchEntity,
  batchMap: Map<number, ProductBatchEntity>,
): void {
  const parentId = batch.parent?.id;
  if (parentId) {
    const parentBatch = batchMap.get(parentId);
    if (parentBatch) {
      batch.parent = parentBatch;
      buildTreeWithParent(parentBatch, batchMap);
    }
  }
}

@Injectable()
export class ProductBatchService {
  constructor(
    @InjectRepository(ProductBatchEntity)
    private readonly repository: Repository<ProductBatchEntity>,
    private readonly productService: ProductService,
    private readonly ozonStateMicroservice: OzonStateMicroservice,
    private readonly contextService: ContextService,
    private readonly statusService: StatusService,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {
    // this.a();
  }

  async getProductBatchesMapByStatusId(
    productBatches: {
      productId: number;
      statusId: number;
      productBatchId?: number;
    }[],
  ): Promise<Map<number, Map<number, ProductBatch[]>>> {
    const entityManager = this.repository;

    // Преобразуем массив объектов в массив строк для SQL-запроса
    const productBatchConditions = productBatches
      .map(pb => {
        const common = `
        pb.product_id = ${pb.productId.toString()}
        AND pb.status_id = ${pb.statusId.toString()}
        `;
        if (pb.productBatchId) {
          return `(
            ${common}
            AND pb.date >= (SELECT date FROM product_batch WHERE id = ${pb.productBatchId.toString()})
            )`;
        } else {
          return `(${common})`;
        }
      })
      .join(' OR ');

    const query = `
    SELECT pb.id
    FROM product_batch pb
    WHERE (${productBatchConditions})
    ORDER BY pb.product_id, pb.date;
  `;

    const rows: { id: number }[] = await entityManager.query(query);

    const pbMapByProductId = new Map<number, Map<number, ProductBatch[]>>();

    const items = await this.findProductBatchByIds(rows.map(row => row.id));

    items.forEach(row => {
      let mapItem = pbMapByProductId.get(row.statusId);
      if (!mapItem) mapItem = new Map<number, ProductBatch[]>();
      let subMapItem = mapItem.get(row.productId);
      if (!subMapItem) subMapItem = [];
      subMapItem.push(row);
      mapItem.set(row.productId, subMapItem);
      pbMapByProductId.set(row.statusId, mapItem);
    });

    return pbMapByProductId;
  }

  async findFromId({ storeId, id }: { storeId: number; id: number }) {
    return this.repository
      .createQueryBuilder('pb')
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
    const last = await this.repository.findOne({
      where: { productId, status: { storeId } },
      relations: ['product', 'status'],
      order: { date: 'desc' },
    });
    return last ? [last] : [];
  }

  async getWithoutChildrenIds(productId?: number) {
    const query = `
WITH without_self_link as (SELECT *
                           FROM product_batch_closure where ancestor_id != descendant_id)
SELECT DISTINCT pbc.descendant_id as id, pb."order"
FROM product_batch_closure pbc
         LEFT JOIN without_self_link pbc2 ON pbc.descendant_id = pbc2.ancestor_id
         LEFT JOIN product_batch pb ON pb.id = pbc.descendant_id
         LEFT JOIN product p ON p.id = pb.product_id
WHERE pbc2.ancestor_id IS NULL
${productId ? `AND product_id = ${productId.toString()}` : ''}
ORDER BY pb."order"
  `;
    const rows = await this.repository.manager.query<{ id: number }[]>(query);
    return rows.map(row => row.id);
  }

  async productBatchList(product_id?: number): Promise<ProductBatch[]> {
    const ids = await this.getWithoutChildrenIds(product_id);
    const map = await this.findProductBatchByIds(ids);
    return [...map.values()];
  }

  async updateProductBatch({
    id,
    statusId: newStatusId,
    order: newOrder,
  }: UpdateProductBatchInput): Promise<ProductBatch[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const batch = await queryRunner.manager.findOneOrFail(
        ProductBatchEntity,
        {
          where: { id },
        },
      );
      // await new Promise((resolve, reject) => setTimeout(reject, 2000));

      if (!newOrder) {
        const lastBatch = await queryRunner.manager.findOne(
          ProductBatchEntity,
          {
            where: { statusId: newStatusId },
            order: { order: 'DESC' },
          },
        );

        newOrder = lastBatch
          ? lastBatch.statusId == batch.statusId
            ? lastBatch.order
            : lastBatch.order + 1
          : 1;
      }

      const oldStatusId = batch.statusId;
      batch.statusId = newStatusId;
      const oldOrder = batch.order;
      batch.order = newOrder;
      await queryRunner.manager.save(batch);

      // Обновите порядок карточек в старом столбце
      if (oldStatusId === newStatusId) {
        // Перемещение внутри одного столбца

        let query = queryRunner.manager
          .createQueryBuilder()
          .update(ProductBatchEntity);
        if (newOrder < oldOrder) {
          query = query
            .set({ order: () => '"order" + 1' })
            .where(
              'statusId = :newStatusId AND id != :id AND "order" >= :newOrder AND "order" <= :oldOrder',
              {
                newStatusId,
                newOrder,
                oldOrder,
                id,
              },
            );
        } else {
          query = query
            .set({ order: () => '"order" - 1' })
            .where(
              'statusId = :newStatusId AND id != :id AND "order" >= :oldOrder AND "order" <= :newOrder',
              {
                newStatusId,
                newOrder,
                oldOrder,
                id,
              },
            );
        }
        await query.execute();
      } else {
        // Перемещение в другой столбец
        await queryRunner.manager
          .createQueryBuilder()
          .update(ProductBatchEntity)
          .set({ order: () => '"order" + 1' })
          .where(
            'statusId = :newStatusId AND "order" >= :newOrder AND id != :id',
            {
              newStatusId,
              newOrder,
              id,
            },
          )
          .execute();

        await queryRunner.manager
          .createQueryBuilder()
          .update(ProductBatchEntity)
          .set({ order: () => '"order" - 1' })
          .where('statusId = :oldStatusId AND "order" > :oldOrder', {
            oldStatusId,
            oldOrder,
            id,
          })
          .execute();
        console.log('a');
      }
      await queryRunner.commitTransaction();

      return this.productBatchList();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async findAncestorsTrees(
    ids: number[],
    queryRunner?: CustomPostgresQueryRunner,
  ): Promise<ProductBatchEntity[]> {
    const subQuery = (queryRunner ? queryRunner.manager : this.repository)
      .createQueryBuilder()
      .select('pbc.ancestor_id')
      .from('product_batch_closure', 'pbc')
      .where('pbc.descendant_id IN (:...ids)', { ids });

    // Основной запрос для получения всех предков
    const ancestors = await (
      queryRunner ? queryRunner.manager : this.repository
    )
      .createQueryBuilder()
      .select('pb')
      .from(ProductBatchEntity, 'pb')
      .leftJoinAndSelect('pb.parent', 'parent')
      .leftJoinAndSelect('pb.product', 'product')
      .leftJoinAndSelect('pb.productBatchOperations', 'pbo')
      .leftJoinAndMapOne(
        'pbo.operation',
        OperationEntity,
        'op',
        'op.id = pbo.operationId',
      )
      .where(`pb.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .getMany();

    // Строим дерево предков с вложенными родительскими элементами
    return buildAncestorTree(ids, ancestors);
  }

  async findProductBatchByIds(
    ids: number[],
    queryRunner?: CustomPostgresQueryRunner,
  ): Promise<StrictMap<number, ProductBatch>> {
    if (!ids.length) return new StrictMap();
    const entities = await this.findAncestorsTrees(ids, queryRunner);
    const calculatePricePerUnit = (
      entity: ProductBatchEntity,
      prevOperationsCostPerUnit = 0,
    ): number => {
      const operationsCostPerUnit =
        prevOperationsCostPerUnit +
        Number(
          entity.productBatchOperations.reduce(
            (prev, cur) => prev + cur.cost,
            0,
          ) / entity.count,
        );

      if (entity.parent)
        return calculatePricePerUnit(entity.parent, operationsCostPerUnit);
      return operationsCostPerUnit + entity.costPrice;
    };
    return new StrictMap(
      entities.map(entity => {
        const pricePerUnit = calculatePricePerUnit(entity);
        return [
          entity.id,
          {
            ...entity,
            pricePerUnit,
            fullPrice: pricePerUnit * entity.count,
            weight: entity.weight,
            volume: entity.volume,
          },
        ];
      }),
    );
  }

  async createProductBatch(
    input: CreateProductBatchInput,
  ): Promise<ProductBatch[]> {
    if (
      !input.parentId &&
      (!input.productId || !input.date || !input.name || !input.costPrice)
    )
      throw new Error('заполни все поля');

    const resultIds: number[] = [];

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let parent: ProductBatchEntity | null = null;
      if (input.parentId) {
        parent = await queryRunner.manager.findOneOrFail(ProductBatchEntity, {
          where: { id: input.parentId },
        });
        if (input.count >= parent.count) {
          throw new BadRequestException(
            `количество не может быть больше или равно чем у предка`,
          );
        }
        if (input.productId && parent.productId != input.productId) {
          throw new BadRequestException(`разные товары`);
        }
        if (input.count < parent.count) {
          /*
           * переместим все партии в order, освободив одно место для нового остаточного
           * */
          await queryRunner.manager
            .createQueryBuilder()
            .update(ProductBatchEntity)
            .set({ order: () => '"order" + 1' })
            .where('statusId = :statusId AND "order" > :order', {
              statusId: parent.statusId,
              order: parent.order,
            })
            .execute();

          let restBatch = new ProductBatchEntity();
          Object.assign(restBatch, omit(parent, 'id'), {
            parent: parent,
            count: parent.count - input.count,
            order: parent.order + 1,
          });
          restBatch = await queryRunner.manager.save(restBatch);
          resultIds.push(restBatch.id);
        }
      }

      let order = input.order;
      if (!order) {
        let lastBatch: ProductBatchEntity | null = null;
        lastBatch = await queryRunner.manager.findOne(ProductBatchEntity, {
          where: { statusId: input.statusId },
          order: { order: 'DESC' },
        });

        order = lastBatch ? lastBatch.order + 1 : 1;
      }

      /*
       * переместим все партии даже в order, освободив одно место для нового остаточного
       * */
      await queryRunner.manager
        .createQueryBuilder()
        .update(ProductBatchEntity)
        .set({ order: () => '"order" + 1' })
        .where('statusId = :statusId AND "order" > :order', {
          statusId: input.statusId,
          order,
        })
        .execute();

      let newEntity = new ProductBatchEntity();
      Object.assign(newEntity, input, { order });
      if (parent) {
        Object.assign(newEntity, omit(parent, ['id', 'order', 'count']), {
          parent: parent,
          count: input.count,
          order,
        });
      }
      newEntity = await queryRunner.manager.save(newEntity);
      resultIds.push(newEntity.id);
      await queryRunner.commitTransaction();

      return [
        ...(await this.findProductBatchByIds(resultIds, queryRunner)).values(),
      ];
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async deleteProductBatch(id: number): Promise<number> {
    await this.repository.delete({ id });
    return id;
  }

  // async splitProductBatch(
  //   input: SplitProductBatchInput,
  // ): Promise<SplitProductBatchResponse> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const parentProductBatch = await queryRunner.manager.findOneOrFail(
  //       ProductBatchEntity,
  //       {
  //         where: { id: input.id },
  //         relations: ['product', 'status'],
  //       },
  //     );
  //     if (parentProductBatch.count <= input.count) {
  //       throw new Error('неверное количество');
  //     }
  //     let firstProductBatch = new ProductBatchEntity();
  //     firstProductBatch.date = parentProductBatch.date;
  //     firstProductBatch.costPrice = parentProductBatch.costPrice;
  //     firstProductBatch.name = parentProductBatch.name;
  //     firstProductBatch.product = parentProductBatch.product;
  //     firstProductBatch.statusId = parentProductBatch.statusId;
  //     firstProductBatch.statusId = parentProductBatch.statusId;
  //     firstProductBatch.count = parentProductBatch.count - input.count;
  //     firstProductBatch = await queryRunner.manager.save(firstProductBatch);
  //
  //     let secondProductBatch = new ProductBatchEntity();
  //     secondProductBatch.date = parentProductBatch.date;
  //     secondProductBatch.name = parentProductBatch.name;
  //     secondProductBatch.costPrice = parentProductBatch.costPrice;
  //     secondProductBatch.product = parentProductBatch.product;
  //     secondProductBatch.statusId =
  //       input.statusId ?? parentProductBatch.statusId;
  //     secondProductBatch.count = input.count;
  //     secondProductBatch = await queryRunner.manager.save(secondProductBatch);
  //
  //     parentProductBatch.children = [firstProductBatch, secondProductBatch];
  //     await queryRunner.manager.save(parentProductBatch);
  //
  //     await queryRunner.commitTransaction();
  //
  //     const newBatches = await this.findProductBatchByIds([
  //       firstProductBatch.id,
  //       secondProductBatch.id,
  //     ]);
  //     return {
  //       newItems: [
  //         newBatches.get(firstProductBatch.id),
  //         newBatches.get(secondProductBatch.id),
  //       ],
  //     };
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     throw err;
  //   } finally {
  //     // you need to release a queryRunner which was manually instantiated
  //     await queryRunner.release();
  //   }
  // }
}
