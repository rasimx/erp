import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import jss from 'json-case-convertor';
import { Repository } from 'typeorm';

import StrictMap from '@/common/helpers/map.js';
import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import {
  type CreateProductBatchInput,
  type ProductBatch,
  type SplitProductBatchInput,
  type SplitProductBatchResponse,
  StoreType,
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

  async getProductBatchesMapByStoreId(
    productBatches: {
      productId: number;
      storeId: number;
      storeType: StoreType;
      productBatchId?: number;
    }[],
  ): Promise<Map<number, Map<number, ProductBatch[]>>> {
    const entityManager = this.repository;

    // Преобразуем массив объектов в массив строк для SQL-запроса
    const productBatchConditions = productBatches
      .map(pb => {
        const common = `
        pb.product_id = ${pb.productId.toString()}
        AND pb.store_id = ${pb.storeId.toString()}
        AND pb.store_type = '${pb.storeType}'
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
      if (!row.storeId) throw new Error('storeId must be defined');
      let mapItem = pbMapByProductId.get(row.storeId);
      if (!mapItem) mapItem = new Map<number, ProductBatch[]>();
      let subMapItem = mapItem.get(row.productId);
      if (!subMapItem) subMapItem = [];
      subMapItem.push(row);
      mapItem.set(row.productId, subMapItem);
      pbMapByProductId.set(row.storeId, mapItem);
    });

    return pbMapByProductId;
  }

  async findFromId({ storeId, id }: { storeId: number; id: number }) {
    return this.repository
      .createQueryBuilder('pb')
      .leftJoinAndSelect('pb.product', 'product')
      .leftJoinAndSelect(
        ProductBatchEntity,
        'pb2',
        'pb.product_id = pb2.product_id',
      )
      .where('pb2.id = :id', { id })
      .andWhere('pb.date::date >= pb2.date::date')
      .andWhere('pb.store_id = :storeId', { storeId })
      .orderBy('pb.date')
      .addOrderBy('pb.created_at')
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
      where: { productId, storeId },
      relations: ['product'],
      order: { date: 'desc' },
    });
    return last ? [last] : [];
  }

  async getWithoutChildrenIds(product_id?: number) {
    const query = `
WITH without_self_link as (SELECT *
                           FROM product_batch_closure where ancestor_id != descendant_id)
SELECT DISTINCT pbc.descendant_id as id
FROM product_batch_closure pbc
         LEFT JOIN without_self_link pbc2 ON pbc.descendant_id = pbc2.ancestor_id
         LEFT JOIN product_batch pb ON pb.id = pbc.descendant_id
         LEFT JOIN product p ON p.id = pb.product_id
WHERE pbc2.ancestor_id IS NULL
${product_id ? 'AND product_id = 41' : ''}
ORDER BY pbc.descendant_id
  `;
    const rows = await this.repository.manager.query<{ id: number }[]>(query);
    return rows.map(row => row.id);
  }

  async productBatchList(product_id?: number): Promise<ProductBatch[]> {
    const ids = await this.getWithoutChildrenIds(product_id);
    const map = await this.findProductBatchByIds(ids);
    return [...map.values()];
  }

  async updateProductBatch(
    input: UpdateProductBatchInput,
  ): Promise<ProductBatch> {
    await this.repository.update({ id: input.id }, { ...input });

    return (await this.findProductBatchByIds([input.id])).get(input.id);
  }

  async findAncestorsTrees(ids: number[]): Promise<ProductBatchEntity[]> {
    const subQuery = this.repository
      .createQueryBuilder()
      .select('pbc.ancestor_id')
      .from('product_batch_closure', 'pbc')
      .where('pbc.descendant_id IN (:...ids)', { ids });

    // Основной запрос для получения всех предков
    const ancestors = await this.repository
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
  ): Promise<StrictMap<number, ProductBatch>> {
    if (!ids.length) return new StrictMap();
    const entities = await this.findAncestorsTrees(ids);
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
  ): Promise<ProductBatch> {
    let newEntity = new ProductBatchEntity();
    Object.assign(newEntity, input);
    newEntity = await this.repository.save(newEntity);
    const items = await this.findProductBatchByIds([newEntity.id]);
    return items.get(newEntity.id);
  }

  async deleteProductBatch(id: number): Promise<number> {
    await this.repository.delete({ id });
    return id;
  }

  async splitProductBatch(
    input: SplitProductBatchInput,
  ): Promise<SplitProductBatchResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const parentProductBatch = await queryRunner.manager.findOneOrFail(
        ProductBatchEntity,
        {
          where: { id: input.id },
          relations: ['product', 'status'],
        },
      );
      if (parentProductBatch.count <= input.count) {
        throw new Error('неверное количество');
      }
      let firstProductBatch = new ProductBatchEntity();
      firstProductBatch.date = parentProductBatch.date;
      firstProductBatch.costPrice = parentProductBatch.costPrice;
      firstProductBatch.name = parentProductBatch.name;
      firstProductBatch.product = parentProductBatch.product;
      firstProductBatch.statusId = parentProductBatch.statusId;
      firstProductBatch.statusId = parentProductBatch.statusId;
      firstProductBatch.count = parentProductBatch.count - input.count;
      firstProductBatch = await queryRunner.manager.save(firstProductBatch);

      let secondProductBatch = new ProductBatchEntity();
      secondProductBatch.date = parentProductBatch.date;
      secondProductBatch.name = parentProductBatch.name;
      secondProductBatch.costPrice = parentProductBatch.costPrice;
      secondProductBatch.product = parentProductBatch.product;
      secondProductBatch.statusId =
        input.statusId ?? parentProductBatch.statusId;
      secondProductBatch.count = input.count;
      secondProductBatch = await queryRunner.manager.save(secondProductBatch);

      parentProductBatch.children = [firstProductBatch, secondProductBatch];
      await queryRunner.manager.save(parentProductBatch);

      await queryRunner.commitTransaction();

      const newBatches = await this.findProductBatchByIds([
        firstProductBatch.id,
        secondProductBatch.id,
      ]);
      return {
        newItems: [
          newBatches.get(firstProductBatch.id),
          newBatches.get(secondProductBatch.id),
        ],
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  // async mergeProductBatch({
  //   sourceProductBatchId,
  //   targetProductBatchId,
  // }: MergeProductBatchInput): Promise<MergeProductBatchResponse> {
  //   // todo: переделать объединение партий
  //   /*
  //    * todo: переделать объединение партий
  //    *  если родительские партии разные, то объениям в новую партию
  //    *  если есть дети у любой партий - ошибка, можно только конечные партии объединять
  //    *  если из одной родительской партии и нет операций к этим партиям, то удаляем эти партии просто
  //    * */
  //   const queryRunner = this.dataSource.createQueryRunner();
  //
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //
  //   const items = await queryRunner.manager.find(ProductBatchEntity, {
  //     where: { id: In([sourceProductBatchId, targetProductBatchId]) },
  //     relations: [
  //       'parents',
  //       'children',
  //       'parents.product',
  //       'productBatchOperations',
  //     ],
  //   });
  //
  //   const sourceProductBatch = items.find(
  //     item => item.id == sourceProductBatchId,
  //   );
  //   if (!sourceProductBatch)
  //     throw new Error(`${sourceProductBatchId} was not found`);
  //   const targetProductBatch = items.find(
  //     item => item.id == targetProductBatchId,
  //   );
  //   if (!targetProductBatch)
  //     throw new Error(`${targetProductBatch} was not found`);
  //
  //   if (items.some(item => item.children.length)) {
  //     throw new Error('можно только конечные партии объединять');
  //   }
  //
  //   if (items[0].productId != items[1].productId) {
  //     throw new Error('партии от разных товаров');
  //   }
  //
  //   try {
  //     if (
  //       sourceProductBatch.parents.length == 1 &&
  //       targetProductBatch.parents.length == 1 &&
  //       sourceProductBatch.parents[0].id == targetProductBatch.parents[0].id &&
  //       items.every(item => !item.productBatchOperations.length)
  //     ) {
  //       // если нет операций и один родитель, просто удаляем партии и возвращаем родителя
  //       await queryRunner.manager.delete(ProductBatchEntity, {
  //         id: In([sourceProductBatchId, targetProductBatchId]),
  //       });
  //       return {
  //         productBatch: {
  //           ...sourceProductBatch.parents[0],
  //           pricePerUnit: 0,
  //           fullPrice: 0,
  //           weight: 0,
  //           volume: 0,
  //         },
  //       };
  //     } else if (
  //       targetProductBatch.parents.length > 1 &&
  //       targetProductBatch.productBatchOperations.length == 0
  //     ) {
  //       // если у партии, куда объединяют нет операций и больше одного родителя,
  //       // то добавляем текущую партию в родители
  //       targetProductBatch.parents.push(sourceProductBatch);
  //       targetProductBatch.count += sourceProductBatch.count;
  //       await queryRunner.manager.save(targetProductBatch);
  //       return {
  //         productBatch: {
  //           ...targetProductBatch,
  //           pricePerUnit: 0,
  //           fullPrice: 0,
  //           weight: 0,
  //           volume: 0,
  //         },
  //       };
  //     } else {
  //       // иначе создаем новую партию с родителями
  //       let newChildProductBatch = new ProductBatchEntity();
  //       newChildProductBatch.date = targetProductBatch.date;
  //       newChildProductBatch.costPrice = sourceProductBatch.costPrice;
  //       newChildProductBatch.productId = sourceProductBatch.productId;
  //       newChildProductBatch.count =
  //         sourceProductBatch.count + targetProductBatch.count;
  //       newChildProductBatch =
  //         await queryRunner.manager.save(newChildProductBatch);
  //       return {
  //         productBatch: {
  //           ...newChildProductBatch,
  //           pricePerUnit: 0,
  //           fullPrice: 0,
  //           weight: 0,
  //           volume: 0,
  //         },
  //       };
  //     }
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     throw err;
  //   } finally {
  //     // you need to release a queryRunner which was manually instantiated
  //     await queryRunner.release();
  //   }
  // }
}
