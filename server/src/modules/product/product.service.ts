import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import type {
  CreateProductInput,
  CreateProductResponse,
  ProductList,
} from '@/graphql.schema.js';
import {
  ProductEntity,
  type ProductInsertEntity,
} from '@/product/product.entity.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async insert(data: ProductInsertEntity[]) {
    await this.repository.insert(data);
    return this.repository.find({
      where: { sku: In(data.map(({ sku }) => sku)) },
    });
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

  async productList(): Promise<ProductList> {
    const [items, totalCount] = await this.repository.findAndCount();
    return { items, totalCount };
  }

  async createProduct(
    input: CreateProductInput,
  ): Promise<CreateProductResponse> {
    // await this.insert([input]);
    return { success: true };
  }
}
