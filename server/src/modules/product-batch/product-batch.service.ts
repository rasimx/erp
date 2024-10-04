import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { type FindOptionsWhere, In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import { ProductRepository } from '@/product/product.repository.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import { ProductBatch } from '@/product-batch/domain/product-batch.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchEventRepository } from '@/product-batch/domain/product-batch-event.repository.js';
import { StatusService } from '@/status/status.service.js';

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
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly productBatchEventRepo: ProductBatchEventRepository,
    private readonly ozonPostingProductMicroservice: OzonPostingProductMicroservice,
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
    // const productBatch = ProductBatch.buildFromEvents(events);
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
}
