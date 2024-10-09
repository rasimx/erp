import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { type FindOptionsWhere, In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import type { RevisionProductEvent } from '@/product/domain/product.events.js';
import { Product } from '@/product/domain/product.js';
import { ProductRepository } from '@/product/domain/product.repository.js';
import { ProductEventRepository } from '@/product/domain/product-event.repository.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import {
  ProductBatchEventType,
  type RevisionProductBatchEvent,
} from '@/product-batch/domain/product-batch.events.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { CreateProductBatchesFromSourcesListDto } from '@/product-batch/dtos/create-product-batches-from-sources-list.dto.js';
import type { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupService } from '@/product-batch-group/product-batch-group.service.js';
import { StatusService } from '@/status/status.service.js';

// try {
//   const result = assembleProduct({
//     product: {
//       id: 10,
//       setItems: [
//         { productId: 11, qty: 1 },
//         { productId: 12, qty: 2 },
//       ],
//     },
//     count: 100,
//     sources: [
//       { id: 1, productId: 11, count: 1000, selectedCount: 100 },
//       // { id: 2, productId: 11, count: 1000, selectedCount: 50 },
//       { id: 3, productId: 12, count: 1000, selectedCount: 150 },
//       { id: 4, productId: 12, count: 1000, selectedCount: 60 },
//     ],
//   });
//   console.log('RESULT', result);
// } catch (e) {
//   console.log('error!!!', e);
// }

@Injectable()
export class ProductBatchService {
  constructor(
    private readonly productService: ProductService,
    private readonly contextService: ContextService,
    private readonly statusService: StatusService,
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly productRepository: ProductRepository,
    private readonly ozonPostingProductMicroservice: OzonPostingProductMicroservice,
    private readonly productRepo: ProductRepository,
    private readonly productEventRepo: ProductEventRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly productBatchEventRepo: ProductBatchEventRepository,
    private readonly productBatchGroupService: ProductBatchGroupService,
  ) {
    // this.a();
  }

  async a() {
    await this.contextService.run(async () => {
      this.contextService.userId = 1;

      return this.recover();
    });
  }

  async recover() {
    // const events = await this.productBatchEventRepo.findByAggregateId(451);
    // const productBatch = Product.buildFromEvents(events);
    //
    // await this.productBatchRepo.save(productBatch.toObject());
    // console.log('AAAAAAAA');
  }

  async relinkPostings({
    queryRunner,
    affectedIds = [],
    affectedGroupIds = [],
    deletedIds = [],
    deletedGroupIds = [],
  }: {
    queryRunner: CustomPostgresQueryRunner;
    affectedIds?: number[];
    affectedGroupIds?: number[];
    deletedIds?: number[];
    deletedGroupIds?: number[];
  }) {
    const where: FindOptionsWhere<ProductBatchEntity>[] = [];
    const ids = [...affectedIds, ...deletedIds];
    if (ids.length) {
      where.push({ id: In(ids) });
    }

    const groupIds = [...affectedGroupIds, ...deletedGroupIds];
    if (groupIds.length) {
      where.push({ groupId: In(groupIds) });
    }
    // здесь запрос идет не в транзакции
    const oldVersions = await this.productBatchRepo.find({
      where,
      relations: ['status', 'group', 'group.status'],
    });

    // здесь в транзакции
    const transactionalProductBatchRepository =
      queryRunner.manager.withRepository(this.productBatchRepo);
    const affectedProductBatches =
      await transactionalProductBatchRepository.find({
        where,
        withDeleted: !!(deletedIds.length || deletedGroupIds.length),
        relations: ['status', 'group', 'group.status'],
      });

    const map = new Map<number, Map<number, number[]>>(); //storeId

    affectedProductBatches.forEach(item => {
      const storeId = item.status?.storeId ?? item.group?.status.storeId;
      if (storeId) {
        const storeMapItem = map.get(storeId) ?? new Map<number, number[]>();
        const productMapItem = storeMapItem.get(item.productId) ?? [];
        productMapItem.push(item.id);
        storeMapItem.set(item.productId, productMapItem);
        map.set(storeId, storeMapItem);
      }
    });

    const storeMap = new Map<number, Map<number, ProductBatchEntity[]>>();
    if (map.size) {
      for (const [storeId, subMap] of map.entries()) {
        const batchesForRelinkMap =
          await transactionalProductBatchRepository.findLatest({
            items: [...subMap.entries()].map(
              ([productId, productBatchIds]) => ({
                productId,
                productBatchIds,
              }),
            ),
            storeId,
          });
        storeMap.set(storeId, batchesForRelinkMap);
      }
    }

    oldVersions.forEach(oldVersion => {
      const status = oldVersion.status ?? oldVersion.group?.status;
      if (!status) throw new Error('status relation is required');
      const oldVersionStoreId = status.storeId;

      if (
        oldVersionStoreId &&
        (!storeMap
          .get(oldVersionStoreId)
          ?.get(oldVersion.productId)
          ?.find(item => item.id == oldVersion.id) ||
          deletedIds.includes(oldVersion.id) ||
          (oldVersion.group && deletedGroupIds.includes(oldVersion.group.id)))
      ) {
        const storeMapItem =
          storeMap.get(oldVersionStoreId) ??
          new Map<number, ProductBatchEntity[]>();
        const productMapItem = storeMapItem.get(oldVersion.productId) ?? [];
        productMapItem.push({
          ...oldVersion,
          count: 0,
        } as ProductBatchEntity);
        storeMapItem.set(oldVersion.productId, productMapItem);
        storeMap.set(oldVersionStoreId, storeMapItem);
      }
    });

    if (storeMap.size) {
      const { success } =
        await this.ozonPostingProductMicroservice.relinkPostings({
          items: [...storeMap.entries()].map(([storeId, mapByProductId]) => ({
            storeId,
            items: [...mapByProductId.entries()].map(
              ([baseProductId, productBatches]) => ({
                baseProductId,
                productBatches,
              }),
            ),
          })),
        });
      if (!success) throw new Error('relink error');
    }
  }

  async createFromSources({
    requestId,
    dto,
    queryRunner,
  }: {
    requestId: string;
    dto: CreateProductBatchesFromSourcesListDto;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<{
    group: ProductBatchGroup | null;
    items: Map<number, ProductBatch>;
  }> {
    const productEventRepo = queryRunner.manager.withRepository(
      this.productEventRepo,
    );
    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    let group: ProductBatchGroup | null = null;
    if (dto.grouped) {
      if (!dto.statusId) throw new Error('dto.statusId was not defined');
      if (!dto.groupName) throw new Error('dto.groupName was not defined');

      group = await this.productBatchGroupService.create({
        requestId,
        queryRunner,
        dto: {
          statusId: dto.statusId,
          name: dto.groupName,
        },
      });

      dto.groupId = group.id;
    }

    const affectedIds: number[] = [];

    const aggregatedIds = await productBatchRepo.nextIds(dto.items.length);

    const lastOrder = dto.groupId
      ? null
      : await productBatchRepo.getLastOrderInStatus(dto.statusId);

    const sourcesEvents = await productBatchEventRepo.findManyByAggregateId(
      dto.items.flatMap(item => item.sourceIds),
    );

    const sourceBathesMap = new Map(
      [...sourcesEvents.entries()].map(([aggregateId, events]) => [
        aggregateId,
        ProductBatch.buildFromEvents(events as RevisionProductBatchEvent[]),
      ]),
    );

    // const products = await productRepo.find({
    //   where: { id: In(dto.items.map(({ productId }) => productId)) },
    //   relations: ['setItems'],
    // });
    // const productsMap = new Map<number, ProductEntity>(
    //   products.map(product => [product.id, product]),
    // );

    const productEvents = await productEventRepo.findManyByAggregateId(
      dto.items.map(({ productId }) => productId),
    );
    const productsMap = new Map<number, Product>(
      [...productEvents.entries()].map(([productId, productEvents]) => [
        productId,
        Product.buildFromEvents(productEvents as RevisionProductEvent[]),
      ]),
    );

    const aggregates: ProductBatch[] = [];

    for (let index = 0; index < dto.items.length; ++index) {
      const aggregateId = aggregatedIds.shift();
      if (!aggregateId) throw new Error('aggregateId was not defined');

      const item = dto.items[index];

      const order = lastOrder ? lastOrder + index + 1 : index + 1;

      const product = productsMap.get(item.productId);
      if (!product) throw new Error('productId was not found');

      const newProductBatch = ProductBatch.createFromSources({
        id: aggregateId,
        count: item.count,
        productProps: product.toObject(),
        statusId: dto.groupId ? null : dto.statusId,
        groupId: dto.groupId,
        order,
        sources: item.sourceIds.map(sourceId => {
          const sourceAggregate = sourceBathesMap.get(sourceId);
          if (!sourceAggregate)
            throw new Error('sourceAggregate was not found');
          // todo: проверить productId через productSet
          const qty = product.toObject().setItems.length
            ? product
                .toObject()
                .setItems.find(
                  item => item.productId === sourceAggregate.getProductId(),
                )?.qty || 1
            : 1;

          return {
            qty,
            productBatch: sourceAggregate,
          };
        }),
      });
      aggregates.push(newProductBatch);
    }

    await productBatchEventRepo.saveAggregateEvents({
      aggregates: [...aggregates, ...sourceBathesMap.values()],
      requestId,
    });

    await productBatchRepo.upsert(
      [...sourceBathesMap.values(), ...aggregates].map(item => item.toObject()),
      ['id'],
    );

    return { group, items: new Map(aggregates.map(item => [item.id, item])) };
  }

  buildFromEvents(args: {
    id: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, ProductBatch>>;
  buildFromEvents(args: {
    id: number;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<ProductBatch>;
  async buildFromEvents({
    id,
    queryRunner,
  }: {
    id: number[] | number;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, ProductBatch> | ProductBatch> {
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    if (Array.isArray(id)) {
      const events = await productBatchEventRepo.findManyByAggregateId(id);

      return new Map(
        [...events.entries()].map(([aggregateId, events]) => [
          aggregateId,
          ProductBatch.buildFromEvents(events as RevisionProductBatchEvent[]),
        ]),
      );
    }
    const events = await productBatchEventRepo.findByAggregateId(id);

    return ProductBatch.buildFromEvents(events as RevisionProductBatchEvent[]);
  }

  async saveAggregates({
    aggregates,
    requestId,
    queryRunner,
  }: {
    aggregates: ProductBatch[];
    requestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );
    const productBatchEventRepo = queryRunner.manager.withRepository(
      this.productBatchEventRepo,
    );

    const events = await productBatchEventRepo.saveAggregateEvents({
      aggregates,
      requestId,
    });

    const entities = await productBatchRepo.save(
      aggregates.map(item => item.toObject()),
    );
    return { events, entities };
  }

  async shouldSplitAndReturnNewChild({
    productBatch,
    queryRunner,
  }: {
    productBatch: ProductBatch;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<ProductBatch | null> {
    if (
      productBatch.getLastEvent().type !=
      ProductBatchEventType.ProductBatchChildCreated
    )
      return null;

    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );

    const aggregatedIds = await productBatchRepo.nextIds(1);

    return ProductBatch.createFromSources({
      ...productBatch.toObject(),
      id: aggregatedIds[0],
      sources: [
        {
          productBatch,
          qty: 1,
        },
      ],
    });
  }
}
