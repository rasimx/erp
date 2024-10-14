import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { type FindOptionsWhere, In } from 'typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { ProductEventRepo } from '@/product/domain/product.event-repo.js';
import { Product } from '@/product/domain/product.js';
import {
  type ProductInsertEntity,
  ProductReadEntity,
} from '@/product/domain/product.read-entity.js';
import { ProductReadRepo } from '@/product/domain/product.read-repo.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly productReadRepo: ProductReadRepo,
    private readonly productEventRepo: ProductEventRepo,
    @InjectDataSource()
    private readonly dataSource: CustomDataSource,
  ) {}

  async saveAggregates({
    aggregates,
    requestId,
    queryRunner,
  }: {
    aggregates: Product[];
    requestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const productReadRepo = queryRunner.manager.withRepository(
      this.productReadRepo,
    );
    const productEventRepo = queryRunner.manager.withRepository(
      this.productEventRepo,
    );

    const eventEntities = await productEventRepo.saveUncommittedEvents({
      aggregates,
      requestId,
    });

    const readEntities = await productReadRepo.save(
      aggregates.map(item => item.toObject()),
    );
    return {
      eventEntities,
      aggregates: readEntities.map(item => Product.createFromReadEntity(item)),
      readEntities,
    };
  }

  async getReadModel({
    id,
    queryRunner,
  }: {
    id: number;
    queryRunner?: CustomPostgresQueryRunner;
  }): Promise<Product> {
    const productReadRepo = queryRunner
      ? queryRunner.manager.withRepository(this.productReadRepo)
      : this.productReadRepo;

    const readEntity = await productReadRepo.findOneOrFail({
      where: { id },
      relations: ['setItems'],
    });

    return Product.createFromReadEntity(readEntity);
  }

  async getReadModelMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, Product>> {
    const productReadRepo = queryRunner.manager.withRepository(
      this.productReadRepo,
    );

    const entities = await productReadRepo.find({
      where: { id: In(ids) },
      relations: ['setItems'],
    });

    if (new Set(ids).size != entities.length) {
      throw new Error('найдены не все элементы');
    }

    return new Map(
      entities.map(item => [item.id, Product.createFromReadEntity(item)]),
    );
  }

  // async insert(data: ProductInsertEntity[]) {
  //   await this.repository.insert(data);
  //   return this.repository.find({
  //     where: { sku: In(data.map(({ sku }) => sku)) },
  //   });
  // }

  async createInsertTransaction(items: ProductInsertEntity[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(ProductReadEntity, items);
      const newItems = await queryRunner.manager.find(ProductReadEntity, {
        where: { sku: In(items.map(({ sku }) => sku)) },
      });

      const transactionId = await queryRunner.prepareTransaction();

      // todo: удалять транзакции по истечении какого-то времени

      return { items: newItems, transactionId };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      return { items: [], error: (error as Error).message };
    } finally {
      await queryRunner.release();
    }
  }

  async findManyBySku(skuList: string[]) {
    return this.productReadRepo.find({
      where: {
        sku: In(skuList),
      },
    });
  }

  // async createProduct(dto: CreateProductDto): Promise<CreateProductResponse> {
  //   // await this.insert([input]);
  //   return {};
  // }
}
