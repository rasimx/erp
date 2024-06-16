import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import jss from 'json-case-convertor';
import { Repository } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import type {
  CreateProductBatchInput,
  ProductBatch,
  SplitProductBatchInput,
  SplitProductBatchResponse,
  UpdateProductBatchInput,
} from '@/graphql.schema.js';
// import type { MergeProductBatchInput } from '@/graphql.schema.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import type { FindLatestRequest } from '@/microservices/proto/erp.pb.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { StatusType } from '@/status/status.entity.js';
import { StatusService } from '@/status/status.service.js';

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
  ) {}

  async getProductBatchesMap(
    statusId: number,
    productBatches: { productId: number; productBatchId?: number }[],
  ): Promise<Map<number, ProductBatchEntity[]>> {
    const entityManager = this.repository;

    // Преобразуем массив объектов в массив строк для SQL-запроса
    const productBatchConditions = productBatches
      .map(pb => {
        if (pb.productBatchId) {
          return `(
        pb.product_id = ${pb.productId.toString()} AND 
        pb.date >= (SELECT date FROM product_batch WHERE id = ${pb.productBatchId.toString()})
      )`;
        } else {
          return `(pb.product_id = ${pb.productId.toString()})`;
        }
      })
      .join(' OR ');

    const query = `
    SELECT pb.*
    FROM product_batch pb
    WHERE pb.status_id = ${statusId.toString()}
      AND (${productBatchConditions})
    ORDER BY pb.product_id, pb.date;
  `;

    const rows: ProductBatchEntity[] = await entityManager
      .query(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .then(row => jss.camelCaseKeys(row));
    const pbMapByProductId = new Map<number, ProductBatchEntity[]>();
    rows.forEach(row => {
      let mapItem = pbMapByProductId.get(row.productId);
      if (!mapItem) mapItem = [];
      mapItem.push(row);
      pbMapByProductId.set(row.productId, mapItem);
    });
    return pbMapByProductId;
  }

  async findFromId({ statusId, id }: { statusId: number; id: number }) {
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
      .andWhere('pb.status_id = :statusId', { statusId })
      .orderBy('pb.date')
      .addOrderBy('pb.created_at')
      .getMany();
  }

  async findLatest({
    productId,
    starterId,
    accountId,
  }: FindLatestRequest): Promise<ProductBatchEntity[]> {
    const status = await this.statusService.findByAccountId(
      accountId,
      StatusType.ozon,
    );
    if (starterId !== undefined)
      return this.findFromId({ statusId: status.id, id: starterId });
    const last = await this.repository.findOne({
      where: { productId, statusId: status.id },
      relations: ['product'],
      order: { date: 'desc' },
    });
    return last ? [last] : [];
  }

  async productBatchList(): Promise<ProductBatch[]> {
    // const items = await this.getFinalItems();
    // const items = await this.repository.find({
    //   relations: ['product', 'status', 'children', 'operations'],
    // });

    const treeItems = await this.repository.manager
      .getTreeRepository(ProductBatchEntity)
      .findTrees({
        relations: [
          'product',
          'status',
          'productBatchOperations',
          'productBatchOperations.operation',
        ],
      });

    const result: ProductBatch[] = [];

    const handle = (items: ProductBatchEntity[], prevPricePerUnit: number) => {
      for (const item of items) {
        const pricePerUnit = Number(
          item.productBatchOperations.reduce(
            (prev, cur) => prev + cur.cost,
            0,
          ) / item.count,
        );

        if (item.children.length) {
          handle(item.children, pricePerUnit + prevPricePerUnit);
        } else {
          result.push({
            ...item,
            volume: item.volume,
            weight: item.weight,
            pricePerUnit: parseInt(
              (pricePerUnit + prevPricePerUnit + item.costPrice).toFixed(0),
            ),
            fullPrice:
              (pricePerUnit + prevPricePerUnit + item.costPrice) * item.count,
          });
        }
      }
    };
    handle(treeItems, 0);

    return result;
  }

  async updateProductBatch(
    input: UpdateProductBatchInput,
  ): Promise<ProductBatch> {
    await this.repository.update({ id: input.id }, { ...input });
    const item = await this.repository.findOneOrFail({
      where: { id: input.id },
      relations: ['product', 'status'],
    });
    return {
      ...item,
      volume: 0,
      weight: item.weight,
      pricePerUnit: 0,
      fullPrice: 0,
    };
  }

  async createProductBatch(
    input: CreateProductBatchInput,
  ): Promise<ProductBatch> {
    const newItem = await this.repository.save(input);
    const item = await this.repository.findOneOrFail({
      where: { id: newItem.id },
      relations: ['product', 'status'],
    });
    return {
      ...item,
      volume: 0,
      weight: item.weight,
      pricePerUnit: 0,
      fullPrice: 0,
    };
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
      firstProductBatch.product = parentProductBatch.product;
      firstProductBatch.statusId = parentProductBatch.statusId;
      firstProductBatch.statusId = parentProductBatch.statusId;
      firstProductBatch.count = parentProductBatch.count - input.count;
      firstProductBatch = await queryRunner.manager.save(firstProductBatch);

      let secondProductBatch = new ProductBatchEntity();
      secondProductBatch.date = parentProductBatch.date;
      secondProductBatch.costPrice = parentProductBatch.costPrice;
      secondProductBatch.product = parentProductBatch.product;
      secondProductBatch.statusId =
        input.statusId ?? parentProductBatch.statusId;
      secondProductBatch.count = input.count;
      secondProductBatch = await queryRunner.manager.save(secondProductBatch);

      parentProductBatch.children = [firstProductBatch, secondProductBatch];
      await queryRunner.manager.save(parentProductBatch);

      await queryRunner.commitTransaction();

      return {
        newItems: [
          {
            ...firstProductBatch,
            pricePerUnit: 0,
            fullPrice: 0,
            weight: 0,
            volume: 0,
            parentId: parentProductBatch.id,
          },
          {
            ...secondProductBatch,
            pricePerUnit: 0,
            fullPrice: 0,
            weight: 0,
            volume: 0,
            parentId: parentProductBatch.id,
          },
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
