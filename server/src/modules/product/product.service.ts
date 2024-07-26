import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, In, Repository } from 'typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import type { CreateProductResponse } from '@/graphql.schema.js';
import type { CreateProductDto } from '@/product/dtos/create-product.dto.js';
import { ProductListDto } from '@/product/dtos/product-list.dto.js';
import {
  ProductEntity,
  type ProductInsertEntity,
} from '@/product/product.entity.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
    @InjectDataSource()
    private readonly dataSource: CustomDataSource,
  ) {}

  async insert(data: ProductInsertEntity[]) {
    await this.repository.insert(data);
    return this.repository.find({
      where: { sku: In(data.map(({ sku }) => sku)) },
    });
  }

  async createInsertTransaction(items: ProductInsertEntity[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(ProductEntity, items);
      const newItems = await queryRunner.manager.find(ProductEntity, {
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

  async upsert(data: ProductInsertEntity[]) {
    return this.repository.insert(data);
  }

  async findOneById(id: number) {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findByIds(ids: number[]) {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    });
  }
  async findManyBySku(skuList: string[]) {
    return this.repository.find({
      where: {
        sku: In(skuList),
      },
    });
  }

  async productList(ids: number[] = []): Promise<ProductListDto> {
    const where: FindOptionsWhere<ProductEntity> = {};
    if (ids.length) {
      where.id = In(ids);
    }
    const [items, totalCount] = await this.repository.findAndCount({
      where,
    });
    return { items, totalCount };
  }

  // async createProduct(dto: CreateProductDto): Promise<CreateProductResponse> {
  //   // await this.insert([input]);
  //   return {};
  // }
}
